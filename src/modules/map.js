import _ from 'lodash';
import rowFormatter from 'lib/rowFormatter';
import Soda from 'lib/Soda';
import { CONFIG } from 'constants';

// --------------------------------------------------
// Constants
// --------------------------------------------------

export const SET_MAP_DATA = 'SET_MAP_DATA';
export const SET_MAP_ERROR = 'SET_MAP_ERROR';
export const SET_MAP_REQUEST_STATUS = 'SET_MAP_REQUEST_STATUS';

// --------------------------------------------------
// Actions
// --------------------------------------------------

function setRawData(data = []) {
  return {
    type: SET_MAP_DATA,
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

function formatIndicatorData(response) {
  return (dispatch, getState) => {
    // typecast data in specific columns (since everything is string in the received JSON)
    const data = response.map(rowFormatter);

    // determine the latest year from available data
    const latestYear = _.chain(data)
      .map(row => row.year)
      .max()
      .value();

    // filter data within the desired data points
    const dataPoints = _.get(getState(), 'appConfig.config.core.data_points');
    const filteredData = data.filter(row => row.year > (latestYear - dataPoints));

    dispatch(setRawData(filteredData));
    dispatch(setRequestStatus(false));
  };
}

function fetchIndicatorData() {
  return (dispatch, getState) => {
    const filters = _.get(getState(), 'filters.selected', {});
    const locationColumn = _.get(getState(), 'appConfig.config.core.location_id_column');

    // if a state other than "US" is selected, also get "US" data
    const filterCondition = Object.keys(filters).map(key => {
      if (key === locationColumn && filters[key].id !== 'US') {
        return {
          operator: 'OR',
          condition: [
            {
              column: key,
              operator: '=',
              value: filters[key].id
            },
            {
              column: key,
              operator: '=',
              value: 'US'
            }
          ]
        };
      }

      return {
        column: key,
        operator: '=',
        value: filters[key].id
      };
    });

    // always add following query conditions
    filterCondition.push({
      column: 'year',
      operator: 'IS NOT NULL'
    });

    new Soda(CONFIG.soda)
      .dataset(CONFIG.data.datasetId)
      .where(filterCondition)
      .order('year')
      .fetchData()
      .then((response) => {
        dispatch(formatIndicatorData(response));
      })
      .catch(() => {
        dispatch(setError(
          true,
          'There was a network error while retrieving data. Please try again.'
        ));
      });
  };
}

export function fetchData() {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(fetchIndicatorData());
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
  data: [],
  error: false,
  errorMessage: '',
  fetching: true
};

export default function mapReducer(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
