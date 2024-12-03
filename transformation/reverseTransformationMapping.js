const reverseTransformationMapping = [
  0, // if identity, apply identity
  3, // if rot 90, rot 270
  2, // if 180, apply 180
  1, // if 270, apply 90
  4, // if vertical, apply vertical
  5, // if horizontal, apply horizontal
  6, // if top left to bottom right, apply same
  7, // if top right to bottom left, apply same
];

module.exports = {
  reverseTransformationMapping,
};
