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
    let closed = path[0].closed;
    let points = [];

    for (let p of path) {
      points.push([
        p.preceding.horiz * width,
        p.preceding.vert * height,
      ]);

      points.push([
        p.anchor.horiz * width,
        p.anchor.vert * height,
      ]);

      points.push([
        p.leaving.horiz * width,
        p.leaving.vert * height,
      ]);
    }

    points.push(points.shift());

    let startPoint = points.shift();
    points.push(startPoint);

    if (!closed) {
      points.pop();
      points.pop();
      points.pop();
    }

    let pathOut = '';
    pathOut += 'M' + startPoint[0] + ' ' + startPoint[1];
    for (let i = 0; i < points.length; i += 3) {
      pathOut += ' C ' + points[i][0] + ' ' + points[i][1];
      pathOut += ', ' + points[i+1][0] + ' ' + points[i+1][1];
      pathOut += ', ' + points[i+2][0] + ' ' + points[i+2][1];
    }

    if (closed) {
      pathOut += ' Z';
    }

    out += `  <path d="${pathOut}" stroke="black" fill="transparent"/>` + '\n';
  }

  out += '</svg>';

  return out;
}
