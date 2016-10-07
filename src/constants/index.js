// actions
const FETCH_DATA = 'FETCH_DATA';
const UPDATE_FILTER_VALUE = 'UPDATE_FILTER_VALUE';
const UPDATE_FILTER_LABEL = 'UPDATE_FILTER_LABEL';
const FETCH_MAP_DATA = 'FETCH_MAP_DATA';

// load application configuration parameters
import CONFIG from './configurations.yml';

// load US States GeoJSON
import GEOJSON from './us-states-geojson.js';

export {
  FETCH_DATA,
  UPDATE_FILTER_VALUE,
  UPDATE_FILTER_LABEL,
  FETCH_MAP_DATA,
  CONFIG,
  GEOJSON
};
