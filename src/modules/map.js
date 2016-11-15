import _ from 'lodash';
import L from 'leaflet';
import { getLatLongBounds, rowFormatter } from 'lib/helpers';
import Soda from 'lib/Soda';
import { setFilter } from 'modules/filters';
import { CONFIG, GEOJSON } from 'constants';

// --------------------------------------------------
// Constants
// --------------------------------------------------

export const SET_MAP_DATA = 'SET_MAP_DATA';
export const SET_MAP_RAW_DATA = 'SET_MAP_RAW_DATA';
export const SET_MAP_ELEMENT = 'SET_MAP_ELEMENT';
export const SET_MAP_FILTER = 'SET_MAP_FILTER';
export const SET_MAP_FILTER_DATA = 'SET_MAP_FILTER_DATA';
export const SET_MAP_ERROR = 'SET_MAP_ERROR';
export const SET_MAP_REQUEST_STATUS = 'SET_MAP_REQUEST_STATUS';

// --------------------------------------------------
// Actions
// --------------------------------------------------

function startsWithVowel(string) {
  return ['a', 'e', 'i', 'o', 'u'].reduce((doesStart, vowel) => {
    return doesStart || string.substring(0, 1).toLowerCase() === vowel;
  }, false);
}

function setMapData(data = {}) {
  return {
    type: SET_MAP_DATA,
    data
  };
}

function setMapRawData(data = []) {
  return {
    type: SET_MAP_RAW_DATA,
    data
  };
}

export function setMapElement(element = null) {
  return {
    type: SET_MAP_ELEMENT,
    element
  };
}

function setMapFilter(filter = {}) {
  return {
    type: SET_MAP_FILTER,
    filter
  };
}

function setMapFilterData(data = []) {
  return {
    type: SET_MAP_FILTER_DATA,
    data
  };
}

function setError(error = true, errorMessage = 'Error') {
  return {
    type: SET_MAP_ERROR,
    error,
    errorMessage
  };
}

function setRequestStatus(status) {
  return {
    type: SET_MAP_REQUEST_STATUS,
    status
  };
}

export function zoomToState(state) {
  return (dispatch, getState) => {
    const mapElement = _.get(getState(), 'map.element');

    if (mapElement) {
      let center = CONFIG.map.defaults.center;
      let zoom = CONFIG.map.defaults.zoom;

      if (state !== 'US') {
        const stateFeature = _.find(GEOJSON.features, {
          properties: {
            abbreviation: state
          }
        });

        if (stateFeature) {
          const bounds = L.latLngBounds(getLatLongBounds(stateFeature.geometry, 0.5));
          center = bounds.getCenter();
          zoom = mapElement.getBoundsZoom(bounds);
        }
      }

      mapElement.setView(center, zoom, { animate: true });
    }
  };
}

export function setStateFilter(abbreviation, state) {
  return (dispatch) => {
    dispatch(setFilter({
      [CONFIG.locationId]: {
        id: abbreviation,
        label: state
      }
    }));
  };
}

export function setMapFilterAndFetchData(filter = {}) {
  return (dispatch) => {
    dispatch(setMapFilter(filter));
    dispatch(fetchData());
  };
}

function formatMapData(response) {
  return (dispatch) => {
    // typecast data in specific columns (since everything is string in the received JSON)
    const data = response.map(rowFormatter);

    dispatch(setMapRawData(data));

    // inject into GeoJSON
    const dataByState = _.groupBy(data, CONFIG.locationId);

    const features = GEOJSON.features.map((feature) => {
      const state = feature.properties.abbreviation;

      if (!dataByState.hasOwnProperty(state)) {
        return feature;
      }

      const properties = Object.assign({}, feature.properties, {
        value: dataByState[state][0].data_value,
        unit: dataByState[state][0].data_value_unit,
        highConfidence: dataByState[state][0].high_confidence_limit,
        lowConfidence: dataByState[state][0].low_confidence_limit
      });

      return Object.assign({}, feature, { properties });
    });

    dispatch(setMapData({
      type: 'FeatureCollection',
      features
    }));
    dispatch(setRequestStatus(false));
  };
}

function fetchData() {
  return (dispatch, getState) => {
    const parentFilters = _.get(getState(), 'filters.selected', {});
    const mapFilters = _.get(getState(), 'map.filterSelected', {});
    const latestYear = _.get(getState(), 'indicatorData.latestYear');

    if (!latestYear) {
      dispatch(setError(
        true,
        'There was an error in configuration.'
      ));
    } else {
      // use all parent filters (minus location) plus map-specific filter
      const parentFilterCondition = Object.keys(parentFilters)
        .filter(column => column !== CONFIG.locationId)
        .map(column => ({
          column,
          operator: '=',
          value: _.get(parentFilters, `${column}.id`, '')
        }));

      const mapFilterCondition = Object.keys(mapFilters)
        .map(column => ({
          column,
          operator: '=',
          value: _.get(mapFilters, `${column}.id`, '')
        }));

      const filterCondition = (mapFilterCondition.length === 0) ? parentFilterCondition :
        parentFilterCondition.concat(mapFilterCondition);

      // apply latest year condition
      filterCondition.push({
        column: 'year',
        operator: '=',
        value: latestYear
      });

      new Soda(CONFIG.soda)
        .dataset(CONFIG.data.datasetId)
        .where(filterCondition)
        .fetchData()
        .then((response) => {
          dispatch(formatMapData(response));
        })
        .catch(() => {
          dispatch(setError(
            true,
            'There was a network error while retrieving data. Please try again.'
          ));
        });
    }
  };
}

function transformFilterData(data) {
  return (dispatch, getState) => {
    // if there is only one (or no) value in breakout values, apply no filter
    if (data.length < 2) {
      dispatch(setMapFilter());
      dispatch(setMapFilterData());
      dispatch(fetchData());
    } else {
      const options = _.chain(data)
        .groupBy(CONFIG.breakoutId)
        .map((dataById) => {
          // use the first element to set label
          return {
            text: dataById[0][CONFIG.breakoutLabel],
            value: dataById[0][CONFIG.breakoutId]
          };
        })
        .sortBy('text')
        .value();

      // select first element by default
      dispatch(setMapFilter({
        [CONFIG.breakoutId]: {
          id: options[0].value,
          label: options[0].text
        }
      }));

      const categoryLabel = _.get(
        getState(),
        `filters.selected.${CONFIG.breakoutCategoryId}.label`,
        'breakout value'
      ).toLowerCase();

      const article = (startsWithVowel(categoryLabel)) ? 'an' : 'a';

      const filter = [{
        label: `Select ${article} ${categoryLabel}`,
        name: CONFIG.breakoutId,
        options
      }];

      dispatch(setMapFilterData(filter));
      dispatch(fetchData());
    }
  };
}

function fetchBreakoutValues() {
  return (dispatch, getState) => {
    const coreConfig = _.get(getState(), 'appConfig.config.core');
    const filters = _.get(getState(), 'filters.selected', {});

    // get all breakout values for selected breakout category
    if (!coreConfig) {
      dispatch(setError(
        true,
        'There was an error in configuration.'
      ));
    } else {
      // don't filter by location column
      const filterCondition = Object.keys(filters).filter(column => column !== CONFIG.locationId)
        .map((column) => {
          return {
            column,
            operator: '=',
            value: _.get(filters, `${column}.id`, '')
          };
        });

      new Soda(CONFIG.soda)
        .dataset(CONFIG.data.datasetId)
        .select(CONFIG.breakoutId, CONFIG.breakoutLabel)
        .where(filterCondition)
        .group(CONFIG.breakoutId, CONFIG.breakoutLabel)
        .order(CONFIG.breakoutLabel)
        .fetchData()
        .then((response) => {
          dispatch(transformFilterData(response));
        })
        .catch(() => {
          dispatch(setError(
            true,
            'There was a network error while retrieving data. Please try again.'
          ));
        });
    }
  };
}

export function initMapContainer() {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(fetchBreakoutValues());
  };
}

// --------------------------------------------------
// Action Handlers
// --------------------------------------------------
const actionsMap = {
  [SET_MAP_DATA]: (state, action) => (
    {
      ...state,
      data: action.data
    }
  ),
  [SET_MAP_RAW_DATA]: (state, action) => (
    {
      ...state,
      rawData: action.data
    }
  ),
  [SET_MAP_ELEMENT]: (state, action) => (
    {
      ...state,
      element: action.element
    }
  ),
  [SET_MAP_FILTER]: (state, action) => (
    {
      ...state,
      filterSelected: { ...action.filter }
    }
  ),
  [SET_MAP_FILTER_DATA]: (state, action) => (
    {
      ...state,
      filterData: action.data
    }
  ),
  [SET_MAP_ERROR]: (state, action) => (
    {
      ...state,
      error: action.error,
      errorMessage: action.errorMessage,
      fetching: false
    }
  ),
  [SET_MAP_REQUEST_STATUS]: (state, action) => (
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
  data: {},
  element: null,
  error: false,
  errorMessage: '',
  fetching: true,
  filterData: [],
  filterSelected: {},
  rawData: []
};

export default function mapReducer(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
