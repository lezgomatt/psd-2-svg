var PSD = require('psd');
var psd = PSD.fromFile(process.argv[2]);
psd.parse();

var out = ''; 

var header = psd.tree().psd.header;
var width = header.width;
var height = header.height;

out += (
  '<svg width="' + width + '" height="' + height
  + '" xmlns="http://www.w3.org/2000/svg">\n'
);

var nodes = psd.tree().descendants();

for (var i = 0; i < nodes.length; i++) {
  var node = nodes[i];
  var layerName = node.get('name');
  var vectorData = node.get('vectorMask');

  if (!vectorData) {
    continue;
  }

  var path = vectorData.export().paths.slice(3); // ignore first 3 records
  var points = [];  

  for (var j = 0; j < path.length; j++) {
    p = path[j];

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

  var startPoint = points.shift();
  points.push(startPoint);
  
  var closed = path[0].closed;
  if (!closed) {
    points.pop();
    points.pop();
    points.pop();
  }

  var pathOut = '';
  pathOut += 'M' + startPoint[0] + ' ' + startPoint[1];
  for (var j = 0; j < points.length; j += 3) {
    pathOut += ' C ' + points[j][0] + ' ' + points[j][1];
    pathOut += ', ' + points[j+1][0] + ' ' + points[j+1][1];
    pathOut += ', ' + points[j+2][0] + ' ' + points[j+2][1];
  }

  if (closed) {
    pathOut += ' Z';
  }

  out += (
    '  <path id="' + layerName.replace(/\s+/, '-') + '" d="' + pathOut
    + '" stroke="black" fill="transparent"/>\n'
  );
}

out += '</svg>\n';
console.log(out);

// [].slice.apply(document.querySelectorAll('path')).map(el => el.id + ': ' + el.getTotalLength()).join('\n');
