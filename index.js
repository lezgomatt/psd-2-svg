const PSD = require('psd');
const { SVG, Path, PathCommand, Point } = require('./classes');
const { PathRecordType } = require('./path-record-types');
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

  let nodes = psd.tree().descendants();
  let paths = [];

  for (let node of nodes) {
    if (node.hidden()) {
      continue;
    }

    // let layerName = node.get('name');

    let vectorMask = node.get('vectorMask');
    if (vectorMask == null) {
      continue;
    }

    let subpaths = getSubpaths(vectorMask, width, height);

    let opacity = roundOff(node.get('opacity') / 255, 2);

    paths.push(new Path(subpaths, { opacity }));
  }

  return new SVG(width, height, paths);
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
          .map(p => new Point(p.x * width, p.y * height));
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
