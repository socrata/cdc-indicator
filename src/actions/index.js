import { UPDATE_INDICATOR, FETCH_DATA } from '../constants';
import Soda from '../lib/Soda';

function setIndicator(indicator) {
  return {
    type: UPDATE_INDICATOR,
    indicator
  };
}

export function delayedSetIndicator(indicator) {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(setIndicator(indicator));
    }, 5000);
  };
}

function transformData(data) {
  const transformedData = data.map((row) => {
    return +row.data_value;
  });

  const xAxis = data.map((row) => {
    return row.year;
  });

  return {
    type: FETCH_DATA,
    data: {
      x: 'x',
      columns: [
        ['x'].concat(xAxis),
        ['National Data'].concat(transformedData)
      ]
    }
  };
}

export function fetchData() {
  return (dispatch) => {
    new Soda({
      appToken: 'bSaNXzPH3PxsgXK3u85KKdTOh',
      hostname: 'chronicdata.cdc.gov',
      useSecure: true
    })
      .dataset('xuxn-8kju')
      .where([
        'locationid = 59',
        'questionid = \'AL002\'',
        'breakoutid = \'GEN1\'',
        'year IS NOT NULL'
      ])
      .order('year')
      .fetchData()
        .then((data) => {
          dispatch(transformData(data));
        });
  };
}
