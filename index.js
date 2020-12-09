const PSD = require('psd');
const { SVG, Path, PathCommand, Point, Color, Group } = require('./classes');
const { PathRecordType, StrokeLineCapType, StrokeLineJoinType } = require('./types');
const { rotate, roundOff } = require('./utils');

exports.convertFile = convertFile;
exports.convertToSvg = convertToSvg;

function convertFile(path) {
  let psd = PSD.fromFile(path);

  return convertToSvg(psd);
}

function convertToSvg(psd) {
  let ok = psd.parse();
  if (!ok) {
    throw new Error('Failed to parse PSD');
  }

  let header = psd.tree().psd.header;
  let width = header.width;
  let height = header.height;

  let nodes = convertNode(psd.tree(), { width, height });

  return new SVG(width, height, nodes);
}

function convertNode(node, params) {
  if (node.isRoot()) {
    return node.children().map(n => convertNode(n, params)).filter(n => n != null);
  }

  let name = node.get('name').trim().replace(/\s+/g, '_');
  let hidden = node.hidden();
  let opacity = roundOff(node.get('opacity') / 255, 2);

  if (node.isGroup()) {
    return new Group(
      node.children().map(n => convertNode(n, params)).filter(n => n != null),
      { name, hidden, opacity }
    );
  }

  let vectorMask = node.get('vectorMask');
  if (vectorMask == null) {
    return null;
  }

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

  return new Path(subpaths, { name, hidden, opacity, fill, stroke });
}

function getStroke(strokeData) {
  let strokeColor = strokeData.strokeStyleContent['Clr '];

  return {
    color: new Color(strokeColor['Rd  '], strokeColor['Grn '], strokeColor['Bl  ']),
    lineCap: getLineCap(strokeData.strokeStyleLineCapType),
    lineJoin: getLineJoin(strokeData.strokeStyleLineJoinType),
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
        subpaths.push(buildPathCommand(isClosed, points));
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

function buildPathCommand(isClosed, points) {
  let cmd = new PathCommand();
  cmd.move(points[0]);

  points = rotate(points);
  if (!isClosed) {
    points = points.slice(0, points.length - 3);
  }

  for (let i = 0; i < points.length; i += 3) {
    cmd.cubicCurve(points[i], points[i + 1], points[i + 2]);
  }

  if (isClosed) {
    cmd.close();
  }

  return cmd;
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
