import { FETCH_DATA, UPDATE_FILTER } from '../constants';
import Soda from '../lib/Soda';

export function setFilter(key, value) {
  return {
    type: UPDATE_FILTER,
    key,
    value
  };
}

function transformData(data) {
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
          dispatch(transformData(data));
        });
  };
}
