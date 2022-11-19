const Psd = require('psd');
const { Svg, Path, PathDefinition, Point, Color, Group, GenericElement, Use } = require('./classes');
const { PathRecordType, StrokeLineAlignment, StrokeLineCapType, StrokeLineJoinType } = require('./types');
const { reverse, rotate, roundOff } = require('./utils');

exports.convertFile = convertFile;
exports.convertToSvg = convertToSvg;

function convertFile(path) {
  let psd = Psd.fromFile(path);

  let ok = psd.parse();
  if (!ok) {
    throw new Error('Failed to parse PSD');
  }

  return convertToSvg(psd);
}

function convertToSvg(psd) {
  let header = psd.tree().psd.header;
  let width = header.width;
  let height = header.height;

  let state = new ConversionState();
  let nodes = convertNode(psd.tree(), state, { width, height });

  return new Svg(width, height, nodes);
}

function convertNode(node, state, params) {
  if (node.isRoot()) {
    return convertChildren(node.children(), state, params);
  }

  let name = node.get('name').trim().replace(/\s+/g, '_').toLowerCase();
  let hidden = node.hidden();
  let opacity = roundOff(node.get('opacity') / 255, 2);

  if (node.isGroup()) {
    let groupNum = ++state.groupCount;
    let children = convertChildren(node.children(), state, params);

    return new Group({ id: `G${groupNum}_${name}`, hidden, opacity }, children);
  }

  let vectorMask = node.get('vectorMask');
  if (vectorMask == null) {
    return null;
  }

  let layerNum = ++state.layerCount;
  let vectorData = node.get('vectorStroke');
  let solidColor = node.get('solidColor');

  let fill = vectorData != null && !vectorData.data.fillEnabled
    ? null
    : solidColor == null
      ? Color.Black
      : new Color(solidColor.r, solidColor.g, solidColor.b);

  let stroke = vectorData == null || !vectorData.data.strokeEnabled
    ? null
    : getStroke(vectorData.data);

  let subpaths = getSubpaths(vectorMask, params.width, params.height);

  if (stroke == null || stroke.alignment === 'center') {
    return new Path({ id: `L${layerNum}_${name}`, hidden, opacity, fill: fill ?? 'none', stroke }, subpaths);
  } else if (stroke.alignment === 'inside') {
    state.maskCount++;

    let pathId = `M${state.maskCount}_path`;
    let maskId = `M${state.maskCount}_inner_stroke_mask`;
    let newStroke = Object.assign(stroke, { width: stroke.width * 2 } );

    let elems = [
      new GenericElement('defs', {}, [
        new Path({ id: pathId }, subpaths),
        new GenericElement('mask', { id: maskId }, [
          new Use(pathId, { fill: Color.White }),
        ]),
      ]),
      new Use(pathId, { fill: fill ?? 'none', stroke: newStroke, mask: maskId }),
    ];

    return new Group({ id: `L${layerNum}_${name}`, hidden, opacity }, elems);
  } else if (stroke.alignment === 'outside') {
    state.maskCount++;

    let pathId = `M${state.maskCount}_path`;
    let maskId = `M${state.maskCount}_outer_stroke_mask`;
    let newStroke = Object.assign(stroke, { width: stroke.width * 2 } );

    let elems = [
      new GenericElement('defs', {}, [
        new Path({ id: pathId }, subpaths),
        new GenericElement('mask', { id: maskId }, [
          new GenericElement('rect', { width: params.width, height: params.height, fill: Color.White }),
          new Use(pathId, { fill: Color.Black }),
        ]),
      ]),
      new Use(pathId, { fill: 'none', stroke: newStroke, mask: maskId }),
    ];

    if (fill != null) {
      elems.push(new Use(pathId, { fill }));
    }

    return new Group({ id: `L${layerNum}_${name}`, hidden, opacity }, elems);
  } else {
    throw new Error('Unknown stroke alignment: ' + stroke.alignment);
  }
}

function convertChildren(children, state, params) {
  let nodes = [];

  // reverse because PSD and SVG have opposite layer ordering
  for (let n of reverse(children)) {
    let result = convertNode(n, state, params);
    if (result != null) {
      nodes.push(result);
    }
  }

  return nodes;
}

function getStroke(strokeData) {
  let strokeColor = strokeData.strokeStyleContent['Clr '];
  let strokeWidth = strokeData.strokeStyleLineWidth.value;
  let strokeDash = strokeData.strokeStyleLineDashSet.map(dash => dash.value * strokeWidth);

  return {
    width: strokeWidth,
    color: new Color(strokeColor['Rd  '], strokeColor['Grn '], strokeColor['Bl  ']),
    alignment: getStrokeAlignment(strokeData.strokeStyleLineAlignment),
    lineCap: getLineCap(strokeData.strokeStyleLineCapType),
    lineJoin: getLineJoin(strokeData.strokeStyleLineJoinType),
    dash: strokeDash.length <= 0 ? null : strokeDash,
  };
}

function getSubpaths(vectorMask, width, height) {
  let pathRecords = vectorMask.paths;
  let subpaths = [];

  for (let i = 0; i < pathRecords.length; i++) {
    let rec = pathRecords[i];
    switch (rec.recordType) {
      case PathRecordType.ClosedSubpathLength:
      case PathRecordType.OpenSubpathLength:
        let isClosed = rec.recordType === PathRecordType.ClosedSubpathLength;
        let points = collectPoints(pathRecords.slice(i + 1, i + 1 + rec.numPoints))
          .map(p => new Point(roundOff(p.x * width, 4), roundOff(p.y * height, 4)));
        subpaths.push(buildPathDefinition(isClosed, points));
        i += rec.numPoints;
        break;
      case PathRecordType.PathFillRule:
      case PathRecordType.Clipboard:
      case PathRecordType.InitialFillRule:
        continue;
      default:
        throw new Error('Unexpected path record type: ' + rec.recordType);
    }
  }

  return subpaths;
}

function collectPoints(knots) {
  let points = [];

  for (let k of knots) {
    points.push(new Point(k.precedingHoriz, k.precedingVert));
    points.push(new Point(k.anchorHoriz, k.anchorVert));
    points.push(new Point(k.leavingHoriz, k.leavingVert));
  }

  return rotate(points);
}

function buildPathDefinition(isClosed, points) {
  let def = new PathDefinition();
  def.move(points[0]);

  points = rotate(points);
  if (!isClosed) {
    points = points.slice(0, points.length - 3);
  }

  for (let i = 0; i < points.length; i += 3) {
    def.cubicCurve(points[i], points[i + 1], points[i + 2]);
  }

  if (isClosed) {
    def.close();
  }

  return def;
}

function getStrokeAlignment(alignData) {
  switch (alignData.value) {
    case StrokeLineAlignment.Center:
      return 'center';
    case StrokeLineAlignment.Inside:
      return 'inside';
    case StrokeLineAlignment.Outside:
      return 'outside';
    default:
      throw new Error('Unknown stroke alignment: ' + alignData.value);
  }
}

function getLineCap(capData) {
  switch (capData.value) {
    case StrokeLineCapType.Butt:
      return 'butt';
    case StrokeLineCapType.Round:
      return 'round';
    case StrokeLineCapType.Square:
      return 'square';
    default:
      throw new Error('Unknown stroke line cap type: ' + capData.value);
  }
}

function getLineJoin(joinData) {
  switch (joinData.value) {
    case StrokeLineJoinType.Miter:
      return 'miter';
    case StrokeLineJoinType.Round:
      return 'round';
    case StrokeLineJoinType.Bevel:
      return 'bevel';
    default:
      throw new Error('Unknown stroke line join type: ' + joinData.value);
  }
}

class ConversionState {
  constructor() {
    this.layerCount = 0;
    this.groupCount = 0;
    this.maskCount = 0;
  }
}
