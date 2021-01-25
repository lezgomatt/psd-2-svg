const tab = '\t';
const newline = '\n';

exports.Svg = class Svg {
  constructor(width, height, nodes) {
    this.width = width;
    this.height = height;
    this.nodes = nodes;
  }

  toString() {
    let lines = [];

    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">`);
    lines = lines.concat(this.nodes.map(n => n.toString(1)));
    lines.push('</svg>');

    return lines.join(newline);
  }
}

exports.Group = class Group {
  constructor(props, children) {
    this.children = children;
    this.name = props.name;
    this.hidden = props.hidden;
    this.opacity = props.opacity;
  }

  toString(numTabs = 0) {
    return tab.repeat(numTabs) + `<g`
      + ` id="${this.name}"`
      + (!this.hidden ? '' : ' visibility="hidden"')
      + (this.opacity === 1 ? '' : ` opacity="${this.opacity}"`)
      + '>'
      + newline + this.children.map(c => c.toString(numTabs + 1)).join(newline)
      + newline + tab.repeat(numTabs) + '</g>';
  }
}

exports.Path = class Path {
  constructor(props, subpaths) {
    this.subpaths = subpaths;
    this.name = props.name;
    this.hidden = props.hidden;
    this.opacity = props.opacity;
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.mask = props.mask;
  }

  toString(numTabs = 0) {
    return tab.repeat(numTabs) + `<path`
    + (this.name == null ? '' : ` id="${this.name}"`)
    + (!this.hidden ? '' : ' visibility="hidden"')
    + (this.opacity == null || this.opacity === 1 ? '' : ` opacity="${this.opacity}"`)
    + (this.fill == null ? ' fill="none"' : ` fill="${this.fill}"`)
    + (this.stroke == null ? '' :
      ` stroke="${this.stroke.color}" stroke-width="${this.stroke.width}"`
      + (this.stroke.lineCap === 'butt' ? '' : ` stroke-linecap="${this.stroke.lineCap}"`)
      + (this.stroke.lineJoin === 'miter' ? '' : ` stroke-linejoin="${this.stroke.lineJoin}"`)
      + (this.stroke.dash == null ? '' : ` stroke-dasharray="${this.stroke.dash.join(',')}"`))
    + (this.mask == null ? '' : ` mask="url(#${this.mask})"`)
    + (this.subpaths.length <= 1 ? '' : ` fill-rule="evenodd"`)
    + newline + tab.repeat(numTabs + 1)
    + `d="${this.subpaths.join(newline + tab.repeat(numTabs + 1))}"/>`
  }
}

exports.PathDefinition = class PathDefinition {
  constructor() {
    this.commands = [];
  }

  move(p) {
    this.commands.push(new PathCommand('M', p));

    return this;
  }

  cubicCurve(p1, p2, p3) {
    this.commands.push(new PathCommand('C', p1, p2, p3));

    return this;
  }

  close() {
    this.commands.push(new PathCommand('Z'));

    return this;
  }

  toString() {
    return this.commands.join(' ');
  }
}

class PathCommand {
  constructor(operator, ...points) {
    this.operator = operator;
    this.operands = points;
  }

  toString() {
    return `${this.operator}` + this.operands.join(',');
  }
}

exports.GenericElement = class GenericElement {
  constructor(name, attrs, children) {
    this.name = name;
    this.attrs = attrs;
    this.children = children;
  }

  strAttrs() {
      let list = [];

      for (const [key, value] of Object.entries(this.attrs)) {
        list.push(`${key}="${value}"`);
      }

      return list.length <= 0 ? '' : ' ' + list.join(' ');
  }

  toString(numTabs = 0) {
    if (this.children == null) {
      return tab.repeat(numTabs) + `<${this.name}${this.strAttrs()}/>`;
    }

    return tab.repeat(numTabs) + `<${this.name}${this.strAttrs()}>`
      + newline + this.children.map(c => c.toString(numTabs + 1)).join(newline)
      + newline + tab.repeat(numTabs) + `</${this.name}>`;
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
  static White = new Color(255, 255, 255);

  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
