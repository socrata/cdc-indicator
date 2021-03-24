// load US States GeoJSON
import GEOJSON from './us-states-geojson.js';

const PROD_CONFIG = (__CONFIG__ === 'production')
  ? require('./configurations.production.yml')
  : require('./configurations.staging.yml');

const CONFIG = (__DEV__)
  ? require('./configurations.development.yml')
  : PROD_CONFIG;

// load local visualizations configurations
const USER_CONFIGURABLE_OPTIONS = (__DEV__)
  ? require('./userConfigurableOptions.yml')
  : {};

const DESKTOP_BREAKPOINT = 960;

export {
  CONFIG,
  DESKTOP_BREAKPOINT,
  USER_CONFIGURABLE_OPTIONS,
  GEOJSON
};
