const tab = '\t';
const newline = '\n';

exports.SVG = class SVG {
  constructor(width, height, paths) {
    this.width = width;
    this.height = height;
    this.paths = paths;
  }

  toString() {
    const indent = newline + tab + tab;

    let lines = [];
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">`);

    for (let p of this.paths) {
      lines.push(
        tab + `<path`
        + ` class="${p.name}"`
        + (!p.hidden ? '' : ' visibility="hidden"')
        + (p.opacity === 1 ? '' : ` opacity="${p.opacity}"`)
        + (p.fill == null ? ' fill="transparent"' : ` fill="${p.fill}"`)
        + (p.stroke == null ? '' :
          ` stroke="${p.stroke.color}" stroke-width="1"`
          + (p.stroke.lineCap === 'butt' ? '' : ` stroke-linecap="${p.stroke.lineCap}"`)
          + (p.stroke.lineJoin === 'miter' ? '' : ` stroke-linejoin="${p.stroke.lineJoin}"`))
        + ` fill-rule="evenodd"`
        + indent + `d="${p.subpaths.join(indent)}"/>`
      );
    }

    lines.push('</svg>');

    return lines.join('\n');
  }
}

exports.Path = class Path {
  constructor(subpaths, props) {
    this.subpaths = subpaths;
    this.name = props.name;
    this.hidden = props.hidden;
    this.opacity = props.opacity;
    this.fill = props.fill;
    this.stroke = props.stroke;
  }
}

exports.PathCommand = class PathCommand {
  constructor() {
    this.commands = [];
  }

  move(p) {
    this.commands.push(`M${p}`);
  }

  cubicCurve(p1, p2, p3) {
    this.commands.push(`C${p1},${p2},${p3}`);
  }

  close() {
    this.commands.push('Z');
  }

  toString() {
    return this.commands.join(' ');
  }
}

exports.Point = class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.x} ${this.y}`;
  }
}

exports.Color = class Color {
  static Black = new Color(0, 0, 0);

  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
