const PSD = require('psd');
const { SVG, Path, PathCommand, Point, Color } = require('./classes');
const { PathRecordType, StrokeLineCapType, StrokeLineJoinType } = require('./types');
const { reverse, rotate, roundOff } = require('./utils');

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

  let nodes = psd.tree().descendants();
  let paths = [];

  for (let node of nodes) {
    let name = node.get('name').trim().replace(/\s+/g, '_');
    let hidden = node.hidden();

    let vectorMask = node.get('vectorMask');
    if (vectorMask == null) {
      continue;
    }

    let subpaths = getSubpaths(vectorMask, width, height);

    let opacity = roundOff(node.get('opacity') / 255, 2);

    let color = node.get('solidColor');
    let fill = color == null ? Color.Black : new Color(color.r, color.g, color.b);
    let stroke = null;

    let vectorData = node.get('vectorStroke');
    if (vectorData != null) {
      if (!vectorData.data.fillEnabled) {
        fill = null;
      }

      if (vectorData.data.strokeEnabled) {
        let strokeColor = vectorData.data.strokeStyleContent['Clr '];
        stroke = {
          color: new Color(strokeColor['Rd  '], strokeColor['Grn '], strokeColor['Bl  ']),
          lineCap: getLineCap(vectorData.data.strokeStyleLineCapType),
          lineJoin: getLineJoin(vectorData.data.strokeStyleLineJoinType),
        };
      }
    }

    paths.push(new Path(subpaths, { name, hidden, opacity, fill, stroke }));
  }

  return new SVG(width, height, reverse(paths));
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
