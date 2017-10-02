/**
 * ChartData - data model to transform SODA output to chart ready format
 */

import _ from 'lodash';
import { CONFIG } from '../constants';

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
    const groupedData = _.chain(this.data)
      // group by location and breakout IDs
      .groupBy((row) =>
        `${row[CONFIG.locationId]}:${row[CONFIG.breakoutId]}`
      )
      .reduce((acc, array) => {
        // use label columns for display
        const key = `${array[0][CONFIG.locationLabel]} - ${array[0][CONFIG.breakoutLabel]}`;
        return Object.assign({}, acc, {
          // keyBy ensures we get just one result (last occurrence)
          [key]: _.keyBy(array, 'year')
        });
      }, {})
      .value();

    // generate x axis values
    const years = _.chain(this.data)
      .groupBy('year')
      .keys()
      .sortBy()
      .value();

    // generate data array based on categories (order is important)
    const columns = [['year'].concat(years)].concat(
      _.map(groupedData, (values, key) => {
        return [key].concat(years.map((year) => {
          if (!values[year] || !values[year].data_value) {
            return null;
          }
          // return _.round(+values[year].data_value, 1);
          return values[year].data_value;
        }));
      })
    );

    const limits = _.reduce(groupedData, (acc, values, key) => {
      return Object.assign({}, acc, {
        [key]: years.map((year) => {
          const hc = _.get(values, `[${year}].high_confidence_limit`);
          const lc = _.get(values, `[${year}].low_confidence_limit`);
          return {
            high: isNaN(hc) ? 'N/A' : hc,
            low: isNaN(lc) ? 'N/A' : lc
          };
        })
      });
    }, {});

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
    const groupedData = _.chain(data)
      .groupBy(CONFIG.locationId)
      .reduce((groupByLocation, valuesByLocation) => {
        const location = valuesByLocation[0][CONFIG.locationLabel];

        return Object.assign({}, groupByLocation, {
          [location]: _.chain(valuesByLocation)
            .groupBy(CONFIG.breakoutId)
            .reduce((groupByBreakout, valuesByBreakout) => {
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
            .value()
        });
      }, {})
      .value();

    // generate x axis values
    const categories = _.chain(data)
      .keyBy(CONFIG.breakoutId)
      .map(value => value[CONFIG.breakoutLabel])
      .sortBy()
      .value();

    // generate data array based on categories (order is important)
    const columns = _.map(groupedData, (value, key) =>
      [key].concat(categories.map((breakout) =>
        _.get(value, `${breakout}.value`, null)
      ))
    );

    // generate data array based on categories (order is important)
    const limits = _.reduce(groupedData, (acc, value, key) => {
      return Object.assign({}, acc, {
        [key]: categories.map((breakout) =>
          _.get(value, `${breakout}.limits`, null)
        )
      });
    }, {});

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
    const groupedByLocation = _.groupBy(this.data, CONFIG.locationId);

    // use National data by default
    let groupedData = groupedByLocation.US || [];
    const state = _.without(Object.keys(groupedByLocation), 'US').shift();

    // .. but if there are two locations, use state's
    if (state) {
      groupedData = groupedByLocation[state];
    }

    // use side effects to get a single unit value
    let unit;

    const transformedData = _.chain(groupedData)
      .groupBy(CONFIG.breakoutId)
      .reduce((groupedByBreakout, valuesByBreakout, breakout) => {
        const label = valuesByBreakout[0][CONFIG.breakoutLabel];
        const data = _.find(valuesByBreakout, { year: this.latestYear });
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
      .value();

    // generate data array based on categories (order is important)
    const columns = _.chain(groupedData)
      .groupBy(CONFIG.breakoutId)
      .keys()
      .sortBy()
      .value()
      .map((breakout) => {
        return [transformedData[breakout].label].concat(transformedData[breakout].value);
      });

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
