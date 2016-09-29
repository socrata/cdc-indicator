import { FETCH_DATA,
         UPDATE_FILTER,
         FETCH_MAP_DATA,
         UPDATE_MAP_FILTER } from '../constants';
import _ from 'lodash';
import Soda from '../lib/Soda';

export function setFilter(key, value) {
  return {
    type: UPDATE_FILTER,
    key,
    value
  };
}

export function setMapFilter(key, value) {
  return {
    type: UPDATE_MAP_FILTER,
    key,
    value
  };
}

function updateData(data) {
  return {
    type: FETCH_DATA,
    data
  };
}

export function fetchData(filter) {
  // format query
  const filterCondition = Object.keys(filter).map((key) => {
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

  filterCondition.push({
    column: 'year',
    operator: 'IS NOT NULL'
  });

  return (dispatch) => {
    new Soda({
      appToken: 'bSaNXzPH3PxsgXK3u85KKdTOh',
      hostname: 'chronicdata.cdc.gov',
      useSecure: true
    })
      .dataset('xuxn-8kju')
      .where(filterCondition)
      .order('year')
      .fetchData()
        .then((data) => {
          dispatch(updateData(data));
        });
  };
}

function updateMapData(responses) {
  const [data, geojson] = responses;

  const dataByState = _.groupBy(data, 'locationdesc');

  // iterate over geojson and put data in
  const features = geojson.features.map((feature) => {
    const state = feature.properties.name;

    if (!dataByState.hasOwnProperty(state)) {
      return feature;
    }

    const properties = Object.assign({}, feature.properties, {
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

export function fetchMapData(primaryFilter, secondaryFilter) {
  const filterCondition = {
    year: secondaryFilter.year,
    breakoutid: secondaryFilter.breakoutid,
    questionid: primaryFilter.questionid
  };

  const dataRequest = new Soda({
    appToken: 'bSaNXzPH3PxsgXK3u85KKdTOh',
    hostname: 'chronicdata.cdc.gov',
    useSecure: true
  })
    .dataset('xuxn-8kju')
    .where(filterCondition)
    .order('year')
    .fetchData();

  const geoJsonRequest = fetch(
    'https://chronicdata.cdc.gov/api/assets/DB7C6A89-BA44-4B22-8AA5-D204CC71EF45?us-states.geojson'
  ).then((response) => response.json());

  return (dispatch) => {
    Promise.all([dataRequest, geoJsonRequest])
      .then((responses) => {
        dispatch(updateMapData(responses));
      });
  };
}
