import _ from 'lodash';
import Soda from 'lib/Soda';
import { CONFIG } from 'constants';

// --------------------------------------------------
// Constants
// --------------------------------------------------

export const SET_FILTER = 'SET_FILTER';
export const SET_FILTER_DATA = 'SET_FILTER_DATA';
export const SET_FILTER_ERROR = 'SET_FILTER_ERROR';
export const SET_FILTER_REQUEST_STATUS = 'SET_FILTER_REQUEST_STATUS';

// --------------------------------------------------
// Actions
// --------------------------------------------------

export function setFilter(filter) {
  return {
    type: SET_FILTER,
    filter
  };
}

function setFilterData(data) {
  return {
    type: SET_FILTER_DATA,
    data
  };
}

function setError(error = true, errorMessage = 'Error') {
  return {
    type: SET_FILTER_ERROR,
    error,
    errorMessage
  };
}

function setRequestStatus(status) {
  return {
    type: SET_FILTER_REQUEST_STATUS,
    status
  };
}

function formatFilterData(responses) {
  return (dispatch, getState) => {
    const filterConfig = _.get(getState(), 'appConfig.config.filter', []);
    const filterData = filterConfig.map((config, index) => {
      const data = responses[index];
      let options;
      let optionGroups;
      let defaultValue = config.default_value;
      let defaultLabel = _.chain(data)
        .find({ [config.value_column]: config.default_value })
        .get(config.label_column)
        .value();

      // if matching default value wasn't found, use the first element
      if (!defaultLabel) {
        defaultValue = data[0][config.value_column];
        defaultLabel = data[0][config.label_column];
      }

      // save default selection in state
      dispatch(setFilter({
        [config.value_column]: {
          id: defaultValue,
          label: defaultLabel
        }
      }));

      if (config.group_by_id) {
        optionGroups = _.chain(data)
          // group by ID column first, in case value is not unique per ID
          .groupBy(config.group_by_id)
          .map((dataByGroup) => {
            // get group value from first element
            const groupLabel = dataByGroup[0][config.group_by];
            // again, group by ID first in case value is not unique for any given ID
            const groupedData = _.chain(dataByGroup)
              .groupBy(config.value_column)
              .map((dataById) => {
                // use the first element to set label
                return {
                  text: dataById[0][config.label_column],
                  value: dataById[0][config.value_column]
                };
              })
              .sortBy('text')
              .value();

            return {
              text: groupLabel,
              options: groupedData
            };
          })
          .sortBy('text')
          .value();
      } else {
        options = _.chain(data)
          .groupBy(config.value_column)
          .map((dataById) => {
            // use the first element to set label
            return {
              text: dataById[0][config.label_column],
              value: dataById[0][config.value_column]
            };
          })
          .sortBy('text')
          .value();
      }

      return {
        label: config.label,
        name: config.value_column,
        options,
        optionGroups
      };
    });

    dispatch(setFilterData(filterData));
    dispatch(setRequestStatus(false));
  };
}

function fetchFilterData() {
  return (dispatch, getState) => {
    const filterConfig = _.get(getState(), 'appConfig.config.filter', []);
    const getFilterPromises = filterConfig.map((config) => {
      const selectColumns = [config.value_column, config.label_column];

      if (config.group_by) {
        selectColumns.unshift(config.group_by, config.group_by_id);
      }

      return new Soda(CONFIG.soda)
        .dataset(CONFIG.data.datasetId)
        .select(selectColumns)
        .where([
          {
            column: config.label_column,
            operator: 'IS NOT NULL'
          },
          {
            column: config.value_column,
            operator: 'IS NOT NULL'
          }
        ])
        .group(selectColumns)
        .order(config.label_column)
        .fetchData();
    });

    Promise.all(getFilterPromises)
      .then((responses) => {
        dispatch(formatFilterData(responses));
      })
      .catch(() => {
        dispatch(setError(
          true,
          'There was a network error while retrieving data. Please try again.'
        ));
      });
  };
}

export function fetchFilters() {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(fetchFilterData());
  };
}

// --------------------------------------------------
// Action Handlers
// --------------------------------------------------
const actionsMap = {
  [SET_FILTER]: (state, action) => (
    {
      ...state,
      selected: {
        ...state.selected,
        ...action.filter
      }
    }
  ),
  [SET_FILTER_DATA]: (state, action) => (
    {
      ...state,
      data: action.data
    }
  ),
  [SET_FILTER_ERROR]: (state, action) => (
    {
      ...state,
      error: action.error,
      errorMessage: action.errorMessage,
      fetching: false
    }
  ),
  [SET_FILTER_REQUEST_STATUS]: (state, action) => (
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
  fetching: true,
  selected: {}
};

export default function filterReducer(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
