// actions
const FETCH_DATA = 'FETCH_DATA';
const FETCH_MAP_DATA = 'FETCH_MAP_DATA';
const FETCH_CONFIG = 'FETCH_CONFIG';
const SET_MAP_ELEMENT = 'SET_MAP_ELEMENT';
const UPDATE_FILTER_VALUE = 'UPDATE_FILTER_VALUE';
const UPDATE_FILTER_LABEL = 'UPDATE_FILTER_LABEL';

const CONFIG = (__DEV__) ?
  require('./configurations.development.yml') :
  require('./configurations.production.yml');

// load local visualizations configurations
const USER_CONFIGURABLE_OPTIONS = (__DEV__) ?
  require('./userConfigurableOptions.yml') :
  {};

// load US States GeoJSON
import GEOJSON from './us-states-geojson.js';

export {
  FETCH_DATA,
  FETCH_CONFIG,
  FETCH_MAP_DATA,
  SET_MAP_ELEMENT,
  UPDATE_FILTER_VALUE,
  UPDATE_FILTER_LABEL,
  CONFIG,
  USER_CONFIGURABLE_OPTIONS,
  GEOJSON
};
