import _ from 'lodash';
import Soda from 'lib/Soda';
import { CONFIG, USER_CONFIGURABLE_OPTIONS } from 'constants';

// --------------------------------------------------
// Constants
// --------------------------------------------------

export const SET_CONFIG = 'SET_CONFIG';
export const SET_ERROR = 'SET_ERROR';
export const SET_REQUEST_STATUS = 'SET_REQUEST_STATUS';

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

function getCoreConfigDataset() {
  return new Soda(CONFIG.soda)
    .dataset(CONFIG.data.appConfigDatasetId)
    .limit(1)
    .fetchData();
}

function getFilterConfigDataset() {
  return new Soda(CONFIG.soda)
    .dataset(CONFIG.data.filterConfigDatasetId)
    .order('sort')
    .fetchData();
}

function getChartConfigDataset() {
  return new Soda(CONFIG.soda)
    .dataset(CONFIG.data.chartConfigDatasetId)
    .where('published=true')
    .order('indicator', 'sort')
    .fetchData();
}

function getDataSourceDataset() {
  return new Soda(CONFIG.soda)
    .dataset(CONFIG.data.indicatorsConfigDatasetId)
    .fetchData();
}

function formatConfig(responses) {
  return (dispatch) => {
    const [coreConfig,
           filterConfig,
           chartConfig,
           dataSourceConfig] = responses;

    // make sure we got core configuration
    if (!coreConfig || !_.isArray(coreConfig) || coreConfig.length < 1) {
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
    const chart = _.groupBy(chartConfig, 'indicator');

    // set data source object
    const dataSource = _.groupBy(dataSourceConfig, CONFIG.indicatorId);

    // save config object
    dispatch(setConfig({ core, filter, chart, dataSource }));
    dispatch(setRequestStatus(false));

    return;
  };
}

function fetchAppConfig() {
  return (dispatch) => {
    // return constants if not using datasets to set these configuration parameters
    if (!CONFIG.data.useConfigurationDatasets) {
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
      .catch(() => {
        dispatch(setError(
          true,
          'There was a network error while retrieving data. Please try again.'
        ));
      });

    return;
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
  [SET_CONFIG]: (state, action) => (
    { ...state, config: action.config }
  ),
  [SET_ERROR]: (state, action) => (
    {
      ...state,
      error: action.error,
      errorMessage: action.errorMessage,
      fetching: false
    }
  ),
  [SET_REQUEST_STATUS]: (state, action) => (
    {
      ...state,
      error: false,
      fetching: action.status
    }
  )
};

// --------------------------------------------------
// Reducers
// --------------------------------------------------
const initialState = {
  config: {},
  error: false,
  errorMessage: '',
  fetching: true
};

export default function appConfigReducer(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
