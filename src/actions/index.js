import { FETCH_DATA,
         UPDATE_FILTER_VALUE,
         UPDATE_FILTER_LABEL,
         SET_MAP_ELEMENT,
         FETCH_MAP_DATA,
         GEOJSON,
         CONFIG } from '../constants';
import _ from 'lodash';
import Soda from '../lib/Soda';

import { fetchAppConfigurations } from './config';

export { fetchAppConfigurations };

function setFilterValue(key, value) {
  return {
    type: UPDATE_FILTER_VALUE,
    key,
    value
  };
}

function setFilterLabel(key, label) {
  return {
    type: UPDATE_FILTER_LABEL,
    key,
    value: label
  };
}

export function setFilter(key, value, label) {
  return (dispatch) => {
    dispatch(setFilterValue(key, value));
    dispatch(setFilterLabel(key, label));
  };
}

export function setState(state) {
  return (dispatch) => {
    dispatch(setFilter('locationabbr', state));
  };
}

function updateData(data) {
  return {
    type: FETCH_DATA,
    data
  };
}

export function setMapElement(mapElement) {
  return {
    type: SET_MAP_ELEMENT,
    mapElement
  };
}

export function fetchData(filter, fromYear) {
  // format query
  const filterCondition = Object.keys(filter)
    .map((key) => {
      // if state data is requested, also query national (US) data
      if (key === 'locationabbr' && filter[key] !== 'US') {
        return {
          operator: 'OR',
          condition: [{
            column: key,
            operator: '=',
            value: filter[key]
          }, {
            column: key,
            operator: '=',
            value: 'US'
          }]
        };
      }

      return {
        column: key,
        operator: '=',
        value: filter[key]
      };
    });

  // always add a condition where year is not null
  filterCondition.push({
    column: 'year',
    operator: 'IS NOT NULL'
  }, {
    column: 'year',
    operator: '>=',
    value: fromYear
  });

  return (dispatch) => {
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.datasetId)
      .where(filterCondition)
      .order('year')
      .fetchData()
        .then((data) => {
          dispatch(updateData(data));
        });
  };
}

function updateMapData(data) {
  const dataByState = _.groupBy(data, 'locationabbr');

  // iterate over geojson and put data in
  const features = GEOJSON.features.map((feature) => {
    const state = feature.properties.abbreviation;

    if (!dataByState.hasOwnProperty(state)) {
      return feature;
    }

    const properties = Object.assign({}, feature.properties, {
      value: +dataByState[state][0].data_value,
      unit: dataByState[state][0].data_value_unit,
      highConfidence: dataByState[state][0].high_confidence_limit,
      lowConfidence: dataByState[state][0].low_confidence_limit
    });

    return Object.assign({}, feature, { properties });
  });

  return {
    type: FETCH_MAP_DATA,
    mapData: {
      type: 'FeatureCollection',
      features
    }
  };
}

export function fetchMapData(filter, year) {
  let queryCondition = Object.assign({}, filter);

  // make sure breakoutid is not included when category is set to Overall
  if (filter.breakoutcategoryid === 'GPOVER') {
    queryCondition = _.omit(filter, 'breakoutid');
  }

  return (dispatch) => {
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.datasetId)
      .where(Object.assign({}, queryCondition, { year }))
      .fetchData()
        .then((response) => {
          dispatch(updateMapData(response));
        });
  };
}

