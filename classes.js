exports.SVG = class SVG {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.paths = [];
  }

  addPath(pathCommand) {
    this.paths.push(pathCommand);
  }

  toString() {
    let lines = [];
    lines.push(`<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`);

    for (let p of this.paths) {
      lines.push('\t' + `<path d="${p}" stroke="black" fill="transparent"/>`);
    }

    lines.push('</svg>');

    return lines.join('\n');
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
