const transformationMapping = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8], // identity (no rotation)
  [2, 5, 8, 1, 4, 7, 0, 3, 6], // rotate 90
  [8, 7, 6, 5, 4, 3, 2, 1, 0], // rotate 180
  [6, 3, 0, 7, 4, 1, 8, 5, 2], // rotate 270
  [6, 7, 8, 3, 4, 5, 0, 1, 2], // vertical reflection
  [2, 1, 0, 5, 4, 3, 8, 7, 6], // horizontal reflection
  [8, 5, 2, 7, 4, 1, 6, 3, 0], // top left to bottom right reflection
  [0, 3, 6, 1, 4, 7, 2, 5, 8], // top right to bottom left reflection
];

module.exports = {
  transformationMapping,
};
