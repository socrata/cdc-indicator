import _get from 'lodash/get';
import _find from 'lodash/find';
import _flow from 'lodash/fp/flow';
import _map from 'lodash/fp/map';
import _sortBy from 'lodash/fp/sortBy';
import _groupBy from 'lodash/fp/groupBy';
import L from 'leaflet';
import { getLatLongBounds, rowFormatter, sendRequest } from 'lib/utils';
import Soda from 'soda-js';
import { setLocationFilter } from 'modules/filters';
import { CONFIG, GEOJSON } from 'constants/index';

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
  return ['a', 'e', 'i', 'o', 'u'].reduce((doesStart, vowel) => (
    doesStart || string.substring(0, 1).toLowerCase() === vowel
  ), false);
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
    const mapElement = _get(getState(), 'map.element');

    if (mapElement) {
      let {
        center,
        zoom
      } = CONFIG.map.defaults;

      if (state !== 'US') {
        const stateFeature = _find(GEOJSON.features, {
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
  return (dispatch, getState) => {
    const states = _get(getState(), `filters.data.${CONFIG.locationId}.options`, []);
    const selectedState = _find(states, { value: abbreviation });
    if (selectedState && !selectedState.isDisabled) {
      dispatch(setLocationFilter({
        id: abbreviation,
        label: state
      }));
    }
  };
}

function formatMapData(response) {
  return (dispatch) => {
    // typecast data in specific columns (since everything is string in the received JSON)
    const data = response.map(rowFormatter);

    dispatch(setMapRawData(data));

    // inject into GeoJSON
    const dataByState = _groupBy(CONFIG.locationId)(data);

    const features = GEOJSON.features.map((feature) => {
      const state = feature.properties.abbreviation;

      if (!Object.prototype.hasOwnProperty.call(dataByState, state)) {
        return feature;
      }

      const properties = {
        ...feature.properties,
        value: dataByState[state][0].data_value,
        unit: dataByState[state][0].data_value_unit,
        dataValueType: dataByState[state][0].data_value_type,
        highConfidence: dataByState[state][0].high_confidence_limit,
        lowConfidence: dataByState[state][0].low_confidence_limit,
        stratification1: dataByState[state][0].stratification1
      };

      return { ...feature, properties };
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
    const parentFilters = _get(getState(), 'filters.selected', {});
    const mapFilters = _get(getState(), 'map.filterSelected', {});
    const latestYear = _get(getState(), 'indicatorData.latestYear');

    if (!latestYear) {
      dispatch(setError(
        true,
        'There was an error in configuration.'
      ));
    } else {
      // set up API request using soda-js
      const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
        apiToken: CONFIG.soda.appToken
      });

      const request = consumer.query()
        .withDataset(CONFIG.app_data.datasetId);

      // use all parent filters (minus location) plus map-specific filter
      Object.keys(parentFilters)
        .filter((column) => column !== CONFIG.locationId)
        .forEach((row) => {
          request.where(`${row}='${_get(parentFilters, `${row}.id`, '')}'`);
        });

      Object.keys(mapFilters)
        .forEach((row) => {
          request.where(`${row}='${_get(mapFilters, `${row}.id`, '')}'`);
        });

      // apply latest year condition
      request.where(`year=${latestYear}`);

      // order results by year descending, location and breakout
      request.order('year desc', CONFIG.locationLabel, CONFIG.breakoutId);

      // dispatch API request and handle response
      sendRequest(request)
        .then((response) => {
          dispatch(formatMapData(response));
        })
        .catch((err) => {
          console.log('fetchData', err); // eslint-disable-line no-console
          dispatch(setError(
            true,
            'There was a network error while retrieving data. Please try again.'
          ));
        });
    }
  };
}

export function setMapFilterAndFetchData(filter = {}) {
  return (dispatch) => {
    dispatch(setMapFilter(filter));
    dispatch(fetchData());
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
      const options = _flow(
        _groupBy(CONFIG.breakoutId),
        _map((dataById) => ({
          // use the first element to set label
          text: dataById[0][CONFIG.breakoutLabel],
          value: dataById[0][CONFIG.breakoutId]
        })),
        _sortBy('text')
      )(data);
      // const options = _.chain(data)
      //   .groupBy(CONFIG.breakoutId)
      //   .map(dataById => ({
      //     // use the first element to set label
      //     text: dataById[0][CONFIG.breakoutLabel],
      //     value: dataById[0][CONFIG.breakoutId]
      //   }))
      //   .sortBy('text')
      //   .value();

      // select first element by default
      dispatch(setMapFilter({
        [CONFIG.breakoutId]: {
          id: options[0].value,
          label: options[0].text
        }
      }));

      const categoryLabel = _get(
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
    const coreConfig = _get(getState(), 'appConfig.config.core');
    const filters = _get(getState(), 'filters.selected', {});

    // get all breakout values for selected breakout category
    if (!coreConfig) {
      dispatch(setError(
        true,
        'There was an error in configuration.'
      ));
    } else {
      // set up API request using soda-js
      const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
        apiToken: CONFIG.soda.appToken
      });

      const request = consumer.query()
        .withDataset(CONFIG.app_data.datasetId);

      // don't filter by location column
      Object.keys(filters)
        .filter((column) => column !== CONFIG.locationId)
        .forEach((row) => {
          request.where(`${row}='${_get(filters, `${row}.id`, '')}'`);
        });

      // group by breakout ID and label to get unique values
      request.select(CONFIG.breakoutId, CONFIG.breakoutLabel);
      request.group(CONFIG.breakoutId, CONFIG.breakoutLabel);
      request.order(CONFIG.breakoutLabel);

      // dispatch API request and handle response
      sendRequest(request)
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
