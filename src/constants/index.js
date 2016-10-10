// actions
const FETCH_DATA = 'FETCH_DATA';
const FETCH_MAP_DATA = 'FETCH_MAP_DATA';
const FETCH_CONFIG = 'FETCH_CONFIG';
const UPDATE_FILTER_VALUE = 'UPDATE_FILTER_VALUE';
const UPDATE_FILTER_LABEL = 'UPDATE_FILTER_LABEL';

// load application configuration parameters
import CONFIG from './configurations.yml';

// load US States GeoJSON
import GEOJSON from './us-states-geojson.js';

export {
  FETCH_DATA,
  FETCH_CONFIG,
  FETCH_MAP_DATA,
  UPDATE_FILTER_VALUE,
  UPDATE_FILTER_LABEL,
  CONFIG,
  GEOJSON
};
