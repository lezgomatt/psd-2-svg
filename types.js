// see https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/
// under "Path records"
exports.PathRecordType = {
  ClosedSubpathLength: 0,
  ClosedSubpathKnotLinked: 1,
  ClosedSubpathKnotUnlinked: 2,

  OpenSubpathLength: 3,
  OpenSubpathKnotLinked: 4,
  OpenSubpathKnotUnlinked: 5,

  PathFillRule: 6,
  Clipboard: 7,
  InitialFillRule: 8,
};

exports.StrokeLineAlignment = {
  Center: 'strokeStyleAlignCenter',
  Inside: 'strokeStyleAlignInside',
  Outside: 'strokeStyleAlignOutside',
}

exports.StrokeLineCapType = {
  Butt: 'strokeStyleButtCap',
  Round: 'strokeStyleRoundCap',
  Square: 'strokeStyleSquareCap',
};

exports.StrokeLineJoinType = {
  Miter: 'strokeStyleMiterJoin',
  Round: 'strokeStyleRoundJoin',
  Bevel: 'strokeStyleBevelJoin',
};
