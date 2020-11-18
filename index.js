const PSD = require('psd');

exports.convertFile = convertFile;
exports.convertToSvg = convertToSvg;

function convertFile(path) {
  let psd = PSD.fromFile(path);

  return convertToSvg(psd);
}

function convertToSvg(psd) {
  psd.parse();
  let out = '';

  let header = psd.tree().psd.header;
  let nodes = psd.tree().descendants();

  let width = header.width;
  let height = header.height;

  out += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` + '\n';

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
      points.push({ x: p.preceding.horiz * width, y: p.preceding.vert * height });
      points.push({ x: p.anchor.horiz * width, y: p.anchor.vert * height });
      points.push({ x: p.leaving.horiz * width, y: p.leaving.vert * height });
    }
    points.push(points.shift());

    let startPoint = points.shift();
    points.push(startPoint);

    if (!isClosed) {
      points.pop();
      points.pop();
      points.pop();
    }

    out += `  <path d="${buildPathCommand(points, startPoint, isClosed)}" stroke="black" fill="transparent"/>` + '\n';
  }

  out += '</svg>';

  return out;
}

function buildPathCommand(points, startPoint, isClosed) {
  let cmd = `M ${pos(startPoint)} `;
  for (let i = 0; i < points.length; i += 3) {
    cmd += `C ${pos(points[i])}, ${pos(points[i+1])}, ${pos(points[i+2])} `;
  }

  if (isClosed) {
    cmd += 'Z';
  }

  return cmd;
}

function pos(point) {
  return `${point.x} ${point.y}`
}
