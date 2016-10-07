import { FETCH_DATA,
         UPDATE_FILTER_VALUE,
         UPDATE_FILTER_LABEL,
         FETCH_MAP_DATA,
         GEOJSON,
         CONFIG } from '../constants';
import _ from 'lodash';
import Soda from '../lib/Soda';
import ChartData from '../lib/ChartData';

function setFilterValue(key, value) {
  return {
    type: UPDATE_FILTER_VALUE,
    key,
    value
  };
}

function setFilterLabel(key, value) {
  // find the corresponding label to filter value
  let label;

  // "breakoutid" is in a separate configuration
  if (key === 'breakoutid') {
    label = _.chain(CONFIG.breakouts)
      .map((row) => row.options)
      .flatten()
      .find({ value })
      .value()
      .text;
  } else {
    const filters = _.find(CONFIG.filters, { name: key });
    if (_.get(filters, 'options')) {
      label = _.find(filters.options, { value }).text;
    } else {
      label = _.chain(filters.optionGroups)
        .map((group) => group.options)
        .flatten()
        .find({ value })
        .value()
        .text;
    }
  }

  return {
    type: UPDATE_FILTER_LABEL,
    key,
    value: label
  };
}

export function setFilter(key, value) {
  return (dispatch) => {
    dispatch(setFilterValue(key, value));
    dispatch(setFilterLabel(key, value));
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

function updateYear(data) {
  const year = new ChartData(data).getLatestYear();
  return {
    type: UPDATE_FILTER_VALUE,
    key: 'year',
    value: year
  };
}

export function fetchData(filter) {
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
          dispatch(updateYear(data));
        });
  };
}

function updateMapData(data) {
  const dataByState = _.groupBy(data, 'locationdesc');

  // iterate over geojson and put data in
  const features = GEOJSON.features.map((feature) => {
    const state = feature.properties.name;

    if (!dataByState.hasOwnProperty(state)) {
      return feature;
    }

    const properties = Object.assign({}, feature.properties, {
      abbreviation: dataByState[feature.properties.name][0].locationabbr,
      value: +dataByState[feature.properties.name][0].data_value
    });

    return Object.assign({}, feature, { properties });
  });

  return {
    type: FETCH_MAP_DATA,
    data: {
      type: 'FeatureCollection',
      features
    }
  };
}

export function fetchMapData(filter) {
  return (dispatch) => {
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.datasetId)
      .where(filter)
      .order('year')
      .fetchData()
        .then((response) => {
          dispatch(updateMapData(response));
        });
  };
}
