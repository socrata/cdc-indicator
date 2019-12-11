import _groupBy from 'lodash/groupBy';
import _isArray from 'lodash/isArray';
import _keyBy from 'lodash/keyBy';
import { sendRequest } from 'lib/utils';
import Soda from 'soda-js';
import { CONFIG, USER_CONFIGURABLE_OPTIONS } from 'constants/index';

// --------------------------------------------------
// Constants
// --------------------------------------------------

export const SET_CONFIG = 'SET_CONFIG';
export const SET_ERROR = 'SET_ERROR';
export const SET_REQUEST_STATUS = 'SET_REQUEST_STATUS';
export const MOBILE_VIEW_ACTIVATED = 'MOBILE_VIEW_ACTIVATED';
export const DESKTOP_VIEW_ACTIVATED = 'DESKTOP_VIEW_ACTIVATED';

// --------------------------------------------------
// Actions
// --------------------------------------------------

function setConfig(config) {
  return {
    type: SET_CONFIG,
    config
  };
}

function setError(error = true, errorMessage = 'Error') {
  return {
    type: SET_ERROR,
    error,
    errorMessage
  };
}

function setRequestStatus(status) {
  return {
    type: SET_REQUEST_STATUS,
    status
  };
}

export function createMobileViewActivated() {
  return {
    type: MOBILE_VIEW_ACTIVATED
  };
}

export function createDesktopViewActivated() {
  return {
    type: DESKTOP_VIEW_ACTIVATED
  };
}

function getCoreConfigDataset() {
  // Set up a SODA request using soda-js
  const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
    apiToken: CONFIG.soda.appToken
  });

  const request = consumer.query()
    .withDataset(CONFIG.app_data.appConfigDatasetId)
    .limit(1);

  return sendRequest(request);
}

function getFilterConfigDataset() {
  // Set up a SODA request using soda-js
  const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
    apiToken: CONFIG.soda.appToken
  });

  const request = consumer.query()
    .withDataset(CONFIG.app_data.filterConfigDatasetId)
    .order('sort');

  return sendRequest(request);
}

function getChartConfigDataset() {
  // Set up a SODA request using soda-js
  const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
    apiToken: CONFIG.soda.appToken
  });

  const request = consumer.query()
    .withDataset(CONFIG.app_data.chartConfigDatasetId)
    .where('published=true')
    .order('indicator', 'sort');

  return sendRequest(request);
}

function getDataSourceDataset() {
  // Set up a SODA request using soda-js
  const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
    apiToken: CONFIG.soda.appToken
  });

  const request = consumer.query()
    .withDataset(CONFIG.app_data.indicatorsConfigDatasetId);

  return sendRequest(request);
}

function formatConfig(responses) {
  return (dispatch) => {
    const [
      coreConfig,
      filterConfig,
      chartConfig,
      dataSourceConfig
    ] = responses;

    // make sure we got core configuration
    if (!coreConfig || !_isArray(coreConfig) || coreConfig.length < 1) {
      dispatch(setError(
        true,
        'Configuration error - core configurations could not be retrieved.'
      ));
      return;
    }

    const core = coreConfig.slice(0, 1)[0];
    const filter = [].concat(...filterConfig);

    // ensure that we have at minimum indicator, location and breakout category filters in config
    const filterColumns = filter.map(row => row.value_column);
    if (filterColumns.indexOf(CONFIG.indicatorId) < 0 ||
      filterColumns.indexOf(CONFIG.locationId) < 0 ||
      filterColumns.indexOf(CONFIG.breakoutCategoryId) < 0) {
      dispatch(setError(
        true,
        'Configuration error - filter configuration does not contain required columns.'
      ));
      return;
    }

    // group chartConfig by indicator
    const chart = _groupBy(chartConfig, 'indicator');

    // set data source object
    const dataSource = _keyBy(dataSourceConfig, CONFIG.indicatorId);

    // save config object
    dispatch(setConfig({
      core,
      filter,
      chart,
      dataSource
    }));
    dispatch(setRequestStatus(false));
  };
}

function fetchAppConfig() {
  return (dispatch) => {
    // return constants if not using datasets to set these configuration parameters
    if (!CONFIG.app_data.useConfigurationDatasets) {
      dispatch(formatConfig([
        USER_CONFIGURABLE_OPTIONS.coreConfig,
        USER_CONFIGURABLE_OPTIONS.filterConfig,
        USER_CONFIGURABLE_OPTIONS.chartConfig,
        USER_CONFIGURABLE_OPTIONS.dataSourcesConfig
      ]));
      return;
    }

    // create promises to get configuration datasets
    const coreConfigPromise = getCoreConfigDataset();
    const filterConfigPromise = getFilterConfigDataset();
    const chartConfigPromise = getChartConfigDataset();
    const dataSourceConfigPromise = getDataSourceDataset();

    Promise.all([
      coreConfigPromise,
      filterConfigPromise,
      chartConfigPromise,
      dataSourceConfigPromise
    ])
      .then((responses) => {
        dispatch(formatConfig(responses));
      })
      .catch((err) => {
        console.log('fetchAppConfig', err); // eslint-disable-line no-console
        dispatch(setError(
          true,
          'There was a network error while retrieving data. Please try again.'
        ));
      });
  };
}

export function fetchConfig() {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(fetchAppConfig());
  };
}

// --------------------------------------------------
// Action Handlers
// --------------------------------------------------
const actionsMap = {
  [SET_CONFIG]: (state, action) => ({
    ...state,
    config: action.config
  }),
  [SET_ERROR]: (state, action) => ({
    ...state,
    error: action.error,
    errorMessage: action.errorMessage,
    fetching: false
  }),
  [SET_REQUEST_STATUS]: (state, action) => ({
    ...state,
    error: false,
    fetching: action.status
  }),
  [MOBILE_VIEW_ACTIVATED]: state => ({
    ...state,
    isDesktopView: false
  }),
  [DESKTOP_VIEW_ACTIVATED]: state => ({
    ...state,
    isDesktopView: true
  })
};

// --------------------------------------------------
// Reducers
// --------------------------------------------------
const initialState = {
  config: {
    core: {},
    dataSource: {}
  },
  error: false,
  errorMessage: '',
  fetching: true,
  isDesktopView: false
};

export default function appConfigReducer(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
