/**
 * helper functions
 */

// vendors
import _ from 'lodash';

/**
 * Find South-West and North-East bounds of a GeoJSON Polygon or MultiPolygon geometry.
 * SW corner is lowest longitude and latitude values and NE corner is the largest.
 * @param  {object} geometry - GeoJSON feature geometry
 * @param  {number} padding - padding to apply, in degrees
 * @return {array} [[SW Lat, SW Long], [NE Lat, NE Long]]
 */
export function getLatLongBounds(geometry, padding = 0) {
  let coordinates;

  // expect geometry to be either Polygon or MultiPolygon
  switch (geometry.type || '') {
    case 'Polygon':
      // coordinates should contain an array of 1 element
      coordinates = [].concat(geometry.coordinates[0]);
      break;
    case 'MultiPolygon':
      // flatten at 2 levels to combine [long, lat] pairs into a single array
      coordinates = _.flattenDepth(geometry.coordinates, 2);
      break;
    default:
      // unexpected type passed
      return undefined;
  }

  // use lodash chain to make it simpler to find min/max values
  const long = _.chain(coordinates)
    .map((coord) => coord[0]);
  const lat = _.chain(coordinates)
    .map((coord) => coord[1]);

  // return as a 2-dimensional array, in [Lat, Long] pairs (not Long, Lat)
  return [
    [
      lat.min().value() - padding,
      long.min().value() - padding
    ],
    [
      lat.max().value() + padding,
      long.max().value() + padding
    ]
  ];
}

export function convertToNumber(str) {
  if (isNaN(parseFloat(str))) {
    return undefined;
  }

  return _.toNumber(str);
}

export function rowFormatter(row) {
  const convertToNumberColumns = [
    'data_value',
    'data_value_alt',
    'high_confidence_limit',
    'low_confidence_limit',
    'year'
  ];

  const newValues = convertToNumberColumns.reduce((acc, key) => {
    return Object.assign({}, acc, {
      [key]: convertToNumber(row[key] || undefined)
    });
  }, {});

  return Object.assign({}, row, newValues);
}
