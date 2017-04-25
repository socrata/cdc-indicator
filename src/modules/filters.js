import _ from 'lodash';
import { sendRequest } from 'lib/utils';
import Soda from 'soda-js';
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

function getAvailableBreakoutCategory() {
  return (dispatch, getState) => {
    dispatch(setRequestStatus(true));

    const indicator = _.get(getState(), `filters.selected.${CONFIG.indicatorId}.id`, '');
    const location = _.get(getState(), `filters.selected.${CONFIG.locationId}.id`, '');

    // set up API request using soda-js
    const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
      apiToken: CONFIG.soda.appToken
    });

    const request = consumer.query()
      .withDataset(CONFIG.data.datasetId)
      .select(CONFIG.breakoutCategoryId)
      .where(
        `${CONFIG.breakoutCategoryId} IS NOT NULL`,
        'year IS NOT NULL',
        'data_value IS NOT NULL',
        `${CONFIG.indicatorId}='${indicator}'`,
        `${CONFIG.locationId}='${location}'`
      )
      .group(CONFIG.breakoutCategoryId);

    // dispatch API request and handle response
    sendRequest(request)
      .then((response) => {
        const availableCategories = response.map(row => row[CONFIG.breakoutCategoryId]);
        dispatch(setAvailableCategories(availableCategories));
      });
  };
}

function getAvailableLocations() {
  return (dispatch, getState) => {
    dispatch(setRequestStatus(true));

    const indicator = _.get(getState(), `filters.selected.${CONFIG.indicatorId}.id`, '');

    // set up API request using soda-js
    const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
      apiToken: CONFIG.soda.appToken
    });

    const request = consumer.query()
      .withDataset(CONFIG.data.datasetId)
      .select(CONFIG.locationId)
      .where(
        `${CONFIG.locationId} IS NOT NULL`,
        'year IS NOT NULL',
        'data_value IS NOT NULL',
        `${CONFIG.indicatorId}='${indicator}'`
      )
      .group(CONFIG.locationId);

    // dispatch API request and handle response
    sendRequest(request)
      .then((response) => {
        const availableLocations = response.map(row => row[CONFIG.locationId]);
        dispatch(setAvailableLocations(availableLocations));
      });
  };
}

function setAvailableCategories(availableCategories) {
  return (dispatch, getState) => {
    const filterData = _.get(getState(), 'filters.data');
    const categoryFilter = filterData[CONFIG.breakoutCategoryId];
    const categoryOptions = categoryFilter.options;

    const newCategoryFilter = Object.assign({}, categoryFilter, {
      options: categoryOptions.map((category) => {
        return {
          text: category.text,
          value: category.value,
          isDisabled: availableCategories.indexOf(category.value) === -1
        };
      })
    });

    dispatch(setFilterData(Object.assign({}, filterData, {
      [CONFIG.breakoutCategoryId]: newCategoryFilter
    })));

    // see if current selection or default choice is a valid choice
    const selected = _.get(getState(), `filters.selected.${CONFIG.breakoutCategoryId}`, {});

    // if there is no current selection or current selection if no available, try default
    if (!selected || availableCategories.indexOf(selected.id) === -1) {
      const filterConfig = _.get(getState(), 'appConfig.config.filter', []);
      const categoryFilterConfig = _.find(filterConfig, {
        value_column: CONFIG.breakoutCategoryId
      });
      let selection;
      if (categoryFilterConfig &&
          availableCategories.indexOf(categoryFilterConfig.default_value) > -1) {
        selection = _.find(newCategoryFilter.options, {
          value: categoryFilterConfig.default_value
        });
      } else {
        // if default is not available, select first element
        selection = _.find(newCategoryFilter.options, {
          isDisabled: false
        });
      }

      dispatch(setFilter({
        [CONFIG.breakoutCategoryId]: {
          id: selection.value,
          label: selection.text
        }
      }));
    }

    dispatch(setRequestStatus(false));
  };
}

function setAvailableLocations(availableLocations) {
  return (dispatch, getState) => {
    const filterData = _.get(getState(), 'filters.data');
    const locationFilter = filterData[CONFIG.locationId];
    const locationOptions = locationFilter.options;

    const newLocationFilter = Object.assign({}, locationFilter, {
      options: locationOptions.map((location) => {
        return {
          text: location.text,
          value: location.value,
          isDisabled: availableLocations.indexOf(location.value) === -1
        };
      })
    });

    dispatch(setFilterData(Object.assign({}, filterData, {
      [CONFIG.locationId]: newLocationFilter
    })));

    // see if current selection or default choice is a valid choice
    const selected = _.get(getState(), `filters.selected.${CONFIG.locationId}`, {});
    let selectedLocation = selected.id;

    // if there is no current selection or current selection if no available, try default
    if (!selected || availableLocations.indexOf(selectedLocation) === -1) {
      const filterConfig = _.get(getState(), 'appConfig.config.filter', []);
      const locationFilterConfig = _.find(filterConfig, { value_column: CONFIG.locationId });
      let selection;
      if (locationFilterConfig &&
          availableLocations.indexOf(locationFilterConfig.default_value) > -1) {
        selection = _.find(newLocationFilter.options, {
          value: locationFilterConfig.default_value
        });
      } else {
        // if default is not available, select first element
        selection = _.find(newLocationFilter.options, {
          isDisabled: false
        });
      }

      selectedLocation = selection.value;
      dispatch(setFilter({
        [CONFIG.locationId]: {
          id: selection.value,
          label: selection.text
        }
      }));
    }

    dispatch(getAvailableBreakoutCategory());
  };
}

export function setLocationFilter(filter) {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(setFilter({ [CONFIG.locationId]: filter }));
    dispatch(getAvailableBreakoutCategory());
  };
}

export function setIndicatorFilter(filter) {
  return (dispatch) => {
    dispatch(setRequestStatus(true));
    dispatch(setFilter({ [CONFIG.indicatorId]: filter }));
    dispatch(getAvailableLocations());
  };
}

function formatFilterData(responses) {
  return (dispatch, getState) => {
    const filterConfig = _.get(getState(), 'appConfig.config.filter', []);

    // set this while we are looping through filter raw data
    let indicatorFilter;
    const filterData = filterConfig.reduce((acc, config, index) => {
      const data = responses[index];
      let options;
      let optionGroups;

      // side effect
      if (config.value_column === CONFIG.indicatorId) {
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
        indicatorFilter = {
          id: defaultValue,
          label: defaultLabel
        };
      }

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
                // get data by descending alpha order
                const dataByIdDesc = _.chain(dataById).orderBy(config.label_column, 'desc').value();
                // use the first element to set label
                return {
                  text: dataByIdDesc[0][config.label_column],
                  value: dataByIdDesc[0][config.value_column],
                  default: dataByIdDesc[0][config.value_column] === config.default_value
                };
              })
              .sortBy('default', 'text')
              .value();

            return {
              text: groupLabel,
              options: groupedData
            };
          })
          // set default to top of list, alpha asc order
          .orderBy(['default', 'text'], ['desc', 'asc'])
          .value();
      } else {
        options = _.chain(data)
          .groupBy(config.value_column)
          .map((dataById) => {
            // get data by descending alpha order
            const dataByIdDesc = _.chain(dataById).orderBy(config.label_column, 'desc').value();
            // use the first element to set label
            return {
              text: dataByIdDesc[0][config.label_column],
              value: dataByIdDesc[0][config.value_column],
              default: dataByIdDesc[0][config.value_column] === config.default_value
            };
          })
          // set default to top of list, alpha asc order
          .orderBy(['default', 'text'], ['desc', 'asc'])
          .value();
      }

      return Object.assign({}, acc, {
        [config.value_column]: {
          label: config.label,
          name: config.value_column,
          options,
          optionGroups
        }
      });
    }, {});

    dispatch(setFilterData(filterData));
    dispatch(setIndicatorFilter(indicatorFilter));
    // dispatch(setRequestStatus(false));
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

      // set up API request using soda-js
      const consumer = new Soda.Consumer(CONFIG.soda.hostname, {
        apiToken: CONFIG.soda.appToken
      });

      const request = consumer.query()
        .withDataset(CONFIG.data.datasetId)
        .select(selectColumns)
        .where(
          `${config.label_column} IS NOT NULL`,
          `${config.value_column} IS NOT NULL`
        )
        .group(selectColumns)
        .order(config.label_column);

      return sendRequest(request);
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
