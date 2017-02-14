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

/**
 * Format a row of data values
 * @param  {object} a data row
 * @return {object} formatted row
 */
export function rowFormatter(row) {
  // keys whose value should be converted to a number
  const convertToNumberColumns = [
    'data_value',
    'data_value_alt',
    'high_confidence_limit',
    'low_confidence_limit',
    'year'
  ];

  // a new object where values are casted to number
  const newValues = convertToNumberColumns.reduce((acc, key) => {
    return Object.assign({}, acc, {
      [key]: _.toNumber((row[key] || undefined), undefined)
    });
  }, {});

  // apply (overwrite) above object to the object passed and return a new object
  return Object.assign({}, row, newValues);
}

/**
 * Wrap soda-js query.getRows() request in a Promise
 * @param  {object} soda - soda-js query object
 * @return {Promise}
 */
export function sendRequest(soda) {
  return new Promise((resolve, reject) => {
    soda.getRows()
      .on('success', (rows) => { resolve(rows); })
      .on('error', (error) => { reject(error); });
  });
}
