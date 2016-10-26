import { FETCH_DATA,
         FETCH_CONFIG,
         UPDATE_FILTER_VALUE,
         UPDATE_FILTER_LABEL,
         SET_MAP_ELEMENT,
         FETCH_MAP_DATA,
         GEOJSON,
         USER_CONFIGURABLE_OPTIONS,
         CONFIG } from '../constants';
import _ from 'lodash';
import Soda from '../lib/Soda';

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

function setConfigurations(responses) {
  const [appConfig,
         filterConfig,
         filters,
         yearConfig,
         chartConfig,
         dataSourceConfig] = responses;

  let config;

  // verify we received critical part of response
  if (_.isArray(appConfig)) {
    config = appConfig[0] || undefined;
  }

  // do not continue if we did not receive expected data
  if (config === undefined) {
    return {
      type: FETCH_CONFIG,
      config
    };
  }

  // re-label some keys since SODA always use _
  const newFilterConfig = filterConfig.map((row, i) => {
    const defaultValue = _.find(filters[i], { [row.value_column]: row.default_value });
    return Object.assign({}, row, {
      name: row.value_column,
      defaultValue: row.default_value,
      defaultLabel: defaultValue[row.label_column]
    });
  });

  // iterate over filter configuration to transform filter values
  // order of filterConfig and filters correspond to each other
  filters.forEach((filter, i) => {
    // if there is a group by specified, pub options into optionGroups array
    if (filterConfig[i].group_by) {
      const groupedData = _.groupBy(filter, filterConfig[i].group_by);
      newFilterConfig[i].optionGroups = _.map(groupedData, (data, key) => {
        return {
          text: key,
          options: data.map((row) => {
            return {
              text: row[filterConfig[i].label_column],
              value: row[filterConfig[i].value_column]
            };
          })
        };
      });
    } else {
      const options = filter.map((row) => {
        return {
          text: row[filterConfig[i].label_column],
          value: row[filterConfig[i].value_column]
        };
      });

      // pull default value and put it as first element
      const defaultValue = _.find(options, { value: newFilterConfig[i].defaultValue });

      newFilterConfig[i].options = options.filter((row) =>
        row.value !== newFilterConfig[i].defaultValue
      );
      newFilterConfig[i].options.unshift(defaultValue);
    }
  });

  // set latest year and year range to query data for
  const latestYear = yearConfig.map((row) => +row.year).sort().pop();
  const fromYear = latestYear - (+(config.data_points || 10)) + 1;

  // set data source object
  const dataSources = _.keyBy(dataSourceConfig, 'questionid');

  config = Object.assign(config, {
    filterConfig: newFilterConfig,
    chartConfig,
    latestYear,
    fromYear,
    dataSources
  });

  return {
    type: FETCH_CONFIG,
    config
  };
}

export function fetchAppConfigurations() {
  // application configurations
  const configPromise = (!CONFIG.data.useConfigurationDatasets) ?
    Promise.resolve(USER_CONFIGURABLE_OPTIONS.app) :
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.appConfigDatasetId)
      .limit(1)
      .fetchData();

  // filter configurations
  const filterConfigPromise = (!CONFIG.data.useConfigurationDatasets) ?
    Promise.resolve(USER_CONFIGURABLE_OPTIONS.filter) :
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.filterConfigDatasetId)
      .order('sort')
      .fetchData();

  // visualization configurations
  const chartConfigPromise = (!CONFIG.data.useConfigurationDatasets) ?
    Promise.resolve(USER_CONFIGURABLE_OPTIONS.chart) :
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.chartConfigDatasetId)
      .where('published=true')
      .order('sort')
      .limit(3)
      .fetchData();

  // indicator data sources configurations
  const dataSourcesPromise = (!CONFIG.data.useConfigurationDatasets) ?
    Promise.resolve(USER_CONFIGURABLE_OPTIONS.indicators) :
    new Soda({
      appToken: CONFIG.data.appToken,
      hostname: CONFIG.data.host,
      useSecure: true
    })
      .dataset(CONFIG.data.indicatorsConfigDatasetId)
      .fetchData();

  // actual filter values based on data
  const filterPromise = filterConfigPromise
    .then((response) => {
      // continue to make data requests to populate filter dropdown
      const promiseArray = response.map((row) => {
        const columnArray = [row.value_column, row.label_column];

        if (row.group_by) {
          columnArray.unshift(row.group_by);
        }

        return new Soda({
          appToken: CONFIG.data.appToken,
          hostname: CONFIG.data.host,
          useSecure: true
        })
          .dataset(CONFIG.data.datasetId)
          .select(columnArray)
          .where([{
            column: row.label_column,
            operator: 'IS NOT NULL'
          }, {
            column: row.value_column,
            operator: 'IS NOT NULL'
          }])
          .group(columnArray)
          .order(row.label_column)
          .fetchData();
      });

      return Promise.all(promiseArray);
    });

  // list of years
  const yearPromise = new Soda({
    appToken: CONFIG.data.appToken,
    hostname: CONFIG.data.host,
    useSecure: true
  })
    .dataset(CONFIG.data.datasetId)
    .where({
      column: 'year',
      operator: 'IS NOT NULL'
    })
    .select('year')
    .group('year')
    .fetchData();

  return (dispatch) => {
    Promise.all([
      configPromise,
      filterConfigPromise,
      filterPromise,
      yearPromise,
      chartConfigPromise,
      dataSourcesPromise
    ])
      .then((responses) => {
        dispatch(setConfigurations(responses));
      });
  };
}
