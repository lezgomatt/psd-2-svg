const PSD = require('psd');
const { SVG, PathCommand, Point } = require('./classes');

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

    let path = vectorData.export().paths.slice(3); // ignore first 3 records
    let isClosed = path[0].closed;
    let points = [];

    for (let p of path) {
      points.push(new Point(p.preceding.horiz * width, p.preceding.vert * height));
      points.push(new Point(p.anchor.horiz * width, p.anchor.vert * height));
      points.push(new Point(p.leaving.horiz * width, p.leaving.vert * height));
    }

    points.push(points.shift());
    let startPoint = points.shift();
    points.push(startPoint);

    if (!isClosed) {
      points.pop();
      points.pop();
      points.pop();
    }

    svg.addPath(buildPathCommand(points, startPoint, isClosed));
  }

  return svg;
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
