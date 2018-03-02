/**
 * ChartData - data model to transform SODA output to chart ready format
 */

import _find from 'lodash/find';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _without from 'lodash/without';
import _flow from 'lodash/fp/flow';
import _groupBy from 'lodash/fp/groupBy';
import _keyBy from 'lodash/fp/keyBy';
import _keys from 'lodash/keys';
import _mapFp from 'lodash/fp/map';
import _reduce from 'lodash/fp/reduce';
import _sortBy from 'lodash/fp/sortBy';
import { CONFIG } from '../constants/index';

export default class ChartData {
  constructor(options) {
    this.test = options;
    this.data = options.data;
    this.dataSeries = options.dataSeries;
    this.latestYear = options.latestYear;
    this.xValues = undefined;
  }

  chartConfig() {
    // if there is no data, return an empty object
    if (this.data.length === 0) {
      return {};
    }

    switch (this.dataSeries) {
      case 'latest':
        this.xValues = 'Breakout category';
        return this._getConfigByBreakout();
      case 'trend':
        this.xValues = 'Year';
        return this._getConfigByYear();
      case 'pie':
        return this._getConfigForPieChart();
      default:
        // do nothing
    }

    return {};
  }

  _getConfigByYear() {
    // group data
    const groupedData = _flow(
      // group by location and breakout IDs
      _groupBy(row => `${row[CONFIG.locationId]}:${row[CONFIG.breakoutId]}`),
      _reduce((acc, array) => {
        // use label columns for display
        const key = `${array[0][CONFIG.locationLabel]} - ${array[0][CONFIG.breakoutLabel]}`;
        return Object.assign({}, acc, {
          // keyBy ensures we get just one result (last occurrence)
          [key]: _keyBy('year')(array)
        });
      }, {})
    )(this.data);
    // const groupedData = _.chain(this.data)
    //   // group by location and breakout IDs
    //   .groupBy(row => `${row[CONFIG.locationId]}:${row[CONFIG.breakoutId]}`)
    //   .reduce((acc, array) => {
    //     // use label columns for display
    //     const key = `${array[0][CONFIG.locationLabel]} - ${array[0][CONFIG.breakoutLabel]}`;
    //     return Object.assign({}, acc, {
    //       // keyBy ensures we get just one result (last occurrence)
    //       [key]: _keyBy('year')(array)
    //     });
    //   }, {})
    //   .value();

    // generate x axis values
    const years = _flow(_sortBy(x => x))(_keys(_groupBy('year', this.data)));
    // const years = _.chain(this.data)
    //   .groupBy('year')
    //   .keys()
    //   .sortBy()
    //   .value();

    // generate data array based on categories (order is important)
    const columns = [['year'].concat(years)].concat(_map(groupedData, (values, key) =>
      [key].concat(years.map((year) => {
        if (!values[year] || !values[year].data_value) {
          return null;
        }
        // return _.round(+values[year].data_value, 1);
        return values[year].data_value;
      }))));

    const limits = _reduce((acc, values, key) => (
      Object.assign({}, acc, {
        [key]: years.map((year) => {
          const hc = _get(values, `[${year}].high_confidence_limit`);
          const lc = _get(values, `[${year}].low_confidence_limit`);
          return {
            high: Number.isNaN(hc) ? 'N/A' : hc,
            low: Number.isNaN(lc) ? 'N/A' : lc
          };
        })
      })
    ), {})(groupedData);

    const yLabel = ((this.data[0].data_value_unit || '').length > 0) ?
      `${this.data[0].data_value_type || ''} (${this.data[0].data_value_unit})` :
      (this.data[0].data_value_type || '');

    return {
      size: {
        height: CONFIG.map.defaults.height || 320
      },
      padding: {
        right: 10
      },
      data: {
        columns,
        x: 'year',
        xFormat: '%Y'
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y'
          }
        },
        y: {
          label: {
            text: yLabel,
            position: 'outer-middle'
          }
        }
      },
      custom: {
        unit: this.data[0].data_value_unit || '',
        limits
      }
    };
  }

  // generate C3 configuration object, when major axis is breakout categories
  _getConfigByBreakout() {
    // work with latest year's data
    const data = this.data.filter(row => row.year === this.latestYear);

    // group data by state (main data series),
    // then by breakout, and get values from the latest year
    const groupedData = _flow(
      _groupBy(CONFIG.locationId),
      _reduce((groupByLocation, valuesByLocation) => {
        const location = valuesByLocation[0][CONFIG.locationLabel];

        return Object.assign({}, groupByLocation, {
          [location]: _flow(
            _groupBy(CONFIG.breakoutId),
            _reduce((groupByBreakout, valuesByBreakout) => {
              const value = valuesByBreakout[0];
              const breakout = value[CONFIG.breakoutLabel];

              return Object.assign({}, groupByBreakout, {
                [breakout]: {
                  value: value.data_value,
                  limits: {
                    high: value.high_confidence_limit,
                    low: value.low_confidence_limit
                  }
                }
              });
            }, {})
          )(valuesByLocation)
        });
      }, {})
    )(data);
    // const groupedData = _.chain(data)
    //   .groupBy(CONFIG.locationId)
    //   .reduce((groupByLocation, valuesByLocation) => {
    //     const location = valuesByLocation[0][CONFIG.locationLabel];

    //     return Object.assign({}, groupByLocation, {
    //       [location]: _.chain(valuesByLocation)
    //         .groupBy(CONFIG.breakoutId)
    //         .reduce((groupByBreakout, valuesByBreakout) => {
    //           const value = valuesByBreakout[0];
    //           const breakout = value[CONFIG.breakoutLabel];

    //           return Object.assign({}, groupByBreakout, {
    //             [breakout]: {
    //               value: value.data_value,
    //               limits: {
    //                 high: value.high_confidence_limit,
    //                 low: value.low_confidence_limit
    //               }
    //             }
    //           });
    //         }, {})
    //         .value()
    //     });
    //   }, {})
    //   .value();

    // generate x axis values
    const categories = _flow(
      _keyBy(CONFIG.breakoutId),
      _mapFp(value => value[CONFIG.breakoutLabel]),
      _sortBy(x => x)
    )(data);
    // const categories = _.chain(data)
    //   .keyBy(CONFIG.breakoutId)
    //   .map(value => value[CONFIG.breakoutLabel])
    //   .sortBy()
    //   .value();

    // generate data array based on categories (order is important)
    const columns = _map(groupedData, (value, key) =>
      [key].concat(categories.map(breakout => _get(value, `${breakout}.value`, null))));

    // generate data array based on categories (order is important)
    const limits = _reduce((acc, value, key) => (
      Object.assign({}, acc, {
        [key]: categories.map(breakout => _get(value, `${breakout}.limits`, null))
      })
    ), {})(groupedData);

    const yLabel = ((this.data[0].data_value_unit || '').length > 0) ?
      `${this.data[0].data_value_type || ''} (${this.data[0].data_value_unit})` :
      (this.data[0].data_value_type || '');

    return {
      size: {
        height: CONFIG.map.defaults.height || 320
      },
      data: {
        columns
      },
      axis: {
        x: {
          categories,
          type: 'category'
        },
        y: {
          label: {
            text: yLabel,
            position: 'outer-middle'
          }
        }
      },
      custom: {
        unit: this.data[0].data_value_unit || '',
        limits
      }
    };
  }

  // get C3 config for a pie chart, where data array is a breakout category
  _getConfigForPieChart() {
    // work with latest year's data
    // const data = this.data.filter(row => row.year === this.latestYear);

    // group data by state (data series) to see if we are displaying state or national data
    const groupedByLocation = _groupBy(CONFIG.locationId)(this.data);

    // use National data by default
    let groupedData = groupedByLocation.US || [];
    const state = _without(Object.keys(groupedByLocation), 'US').shift();

    // .. but if there are two locations, use state's
    if (state) {
      groupedData = groupedByLocation[state];
    }

    // use side effects to get a single unit value
    let unit;

    const transformedData = _flow(
      _groupBy(CONFIG.breakoutId),
      _reduce((groupedByBreakout, valuesByBreakout, breakout) => {
        const label = valuesByBreakout[0][CONFIG.breakoutLabel];
        const data = _find(valuesByBreakout, { year: this.latestYear });
        let value = 0;

        if (data) {
          // side effect
          if (unit === undefined || unit === '') {
            unit = data.data_value_unit || '';
          }

          value = data.data_value;
        }

        return Object.assign({}, groupedByBreakout, {
          [breakout]: { value, label }
        });
      }, {})
    )(groupedData);
    // const transformedData = _.chain(groupedData)
    //   .groupBy(CONFIG.breakoutId)
    //   .reduce((groupedByBreakout, valuesByBreakout, breakout) => {
    //     const label = valuesByBreakout[0][CONFIG.breakoutLabel];
    //     const data = _find(valuesByBreakout, { year: this.latestYear });
    //     let value = 0;

    //     if (data) {
    //       // side effect
    //       if (unit === undefined || unit === '') {
    //         unit = data.data_value_unit || '';
    //       }

    //       value = data.data_value;
    //     }

    //     return Object.assign({}, groupedByBreakout, {
    //       [breakout]: { value, label }
    //     });
    //   }, {})
    //   .value();

    // generate data array based on categories (order is important)
    const columns = (_flow(
      _groupBy(CONFIG.breakoutId),
      _keys(),
      _sortBy(x => x)
    )(groupedData)).map(breakout =>
      [transformedData[breakout].label].concat(transformedData[breakout].value));
    // const columns = _.chain(groupedData)
    //   .groupBy(CONFIG.breakoutId)
    //   .keys()
    //   .sortBy()
    //   .value()
    //   .map(breakout =>
    //    [transformedData[breakout].label].concat(transformedData[breakout].value));

    return {
      size: {
        height: CONFIG.map.defaults.height || 320
      },
      data: {
        columns
      },
      custom: {
        unit
      }
    };
  }
}
