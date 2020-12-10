const { reverse } = require('./utils');

const tab = '\t';
const newline = '\n';

exports.SVG = class SVG {
  constructor(width, height, nodes) {
    this.width = width;
    this.height = height;
    this.nodes = nodes;
  }

  toString() {
    let lines = [];
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">`);
    lines = lines.concat(reverse(this.nodes).map(n => n.toString(1)));
    lines.push('</svg>');

    return lines.join(newline);
  }
}

exports.Group = class Group {
  constructor(children, props) {
    this.children = children;
    this.name = props.name;
    this.hidden = props.hidden;
    this.opacity = props.opacity;
  }

  toString(numTabs = 0) {
    return tab.repeat(numTabs) + `<g`
      + ` class="${this.name}"`
      + (!this.hidden ? '' : ' visibility="hidden"')
      + (this.opacity === 1 ? '' : ` opacity="${this.opacity}"`)
      + '>'
      + newline + reverse(this.children).map(c => c.toString(numTabs + 1)).join(newline)
      + newline + tab.repeat(numTabs) + '</g>';
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

  toString(numTabs = 0) {
    return tab.repeat(numTabs) + `<path`
    + ` class="${this.name}"`
    + (!this.hidden ? '' : ' visibility="hidden"')
    + (this.opacity === 1 ? '' : ` opacity="${this.opacity}"`)
    + (this.fill == null ? ' fill="transparent"' : ` fill="${this.fill}"`)
    + (this.stroke == null ? '' :
      ` stroke="${this.stroke.color}" stroke-width="${this.stroke.width}"`
      + (this.stroke.lineCap === 'butt' ? '' : ` stroke-linecap="${this.stroke.lineCap}"`)
      + (this.stroke.lineJoin === 'miter' ? '' : ` stroke-linejoin="${this.stroke.lineJoin}"`))
    + ` fill-rule="evenodd"`
    + newline + tab.repeat(numTabs + 1)
    + `d="${this.subpaths.join(newline + tab.repeat(numTabs + 1))}"/>`
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
