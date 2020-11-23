const PSD = require('psd');
const { SVG, PathCommand, Point } = require('./classes');
const { PathRecordType } = require('./path-record-types');
const { last, rotate } = require('./utils');

exports.convertFile = convertFile;
exports.convertToSvg = convertToSvg;

function convertFile(path) {
  let psd = PSD.fromFile(path);

  return convertToSvg(psd);
}

function convertToSvg(psd) {
  psd.parse();

  let header = psd.tree().psd.header;
  let nodes = psd.tree().descendants();

  let width = header.width;
  let height = header.height;
  let svg = new SVG(width, height);

  for (let node of nodes) {
    // let layerName = node.get('name');
    let vectorData = node.get('vectorMask');
    if (!vectorData) {
      continue;
    }

    let pathRecords = vectorData.export().paths;
    for (let i = 0; i < pathRecords.length; i++) {
      let rec = pathRecords[i];
      let points = null;
      let startPoint = null;

      switch (rec.recordType) {
        case PathRecordType.ClosedSubpathLength:
          points = collectPoints(pathRecords.slice(i + 1, i + 1 + rec.numPoints))
            .map(p => new Point(p.x * width, p.y * height));
          startPoint = last(points);
          svg.addPath(buildPathCommand(points, startPoint, true));
          i += rec.numPoints;
          break;
        case PathRecordType.OpenSubpathLength:
          points = collectPoints(pathRecords.slice(i + 1, i + 1 + rec.numPoints))
            .map(p => new Point(p.x * width, p.y * height));
          startPoint = last(points);
          points = points.slice(0, points.length - 3);
          svg.addPath(buildPathCommand(points, startPoint, false));
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
  }

  return svg;
}

function collectPoints(knots) {
  let points = [];

  for (let k of knots) {
    points.push(new Point(k.preceding.horiz, k.preceding.vert));
    points.push(new Point(k.anchor.horiz, k.anchor.vert));
    points.push(new Point(k.leaving.horiz, k.leaving.vert));
  }

  return rotate(points, 2);
}

function buildPathCommand(points, startPoint, isClosed) {
  let cmd = new PathCommand();
  cmd.move(startPoint);

  for (let i = 0; i < points.length; i += 3) {
    cmd.cubicCurve(points[i], points[i + 1], points[i + 2]);
  }

  if (isClosed) {
    cmd.close();
  }

  return cmd;
}
