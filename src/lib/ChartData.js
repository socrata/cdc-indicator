/**
 * ChartData - data model to transform SODA output to chart ready format
 */

import _ from 'lodash';

function sumDataValue(sum, row) {
  return sum + parseFloat(row.data_value || 0);
}

export default class ChartData {

  constructor(data = [], majorAxis = 'breakout') {
    this.data = data;
    this.majorAxis = majorAxis;
  }

  chartConfig() {
    // if there is no data, return an empty object
    if (this.data.length === 0) {
      return {};
    }

    switch (this.majorAxis) {
      case 'breakout':
        return this._getConfigByBreakout();
      case 'year':
        return this._getConfigByYear();
      default:
        // do nothing
    }

    return {};
  }

  _getConfigByYear() {
    // group data
    const groupedData = _.chain(this.data)
      .groupBy((row) =>
        `${row.locationdesc} - ${row.break_out}`
      )
      .reduce((acc, array, key) => {
        return Object.assign({}, acc, {
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
          return parseFloat(values[year].data_value);
        }));
      })
    );

    return {
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
        }
      }
    };
  }

  // get C3 config where major axis is breakout categories
  _getConfigByBreakout() {
    // group data by state (data series),
    // then by breakout, and sum results
    const groupedData = _.chain(this.data)
      .groupBy('locationdesc')
      .reduce((groupByLocation, valuesByLocation, location) => {
        return Object.assign({}, groupByLocation, {
          [location]: _.chain(valuesByLocation)
            .groupBy('break_out')
            .reduce((groupByBreakout, valuesByBreakout, breakout) => {
              return Object.assign({}, groupByBreakout, {
                [breakout]: _.chain(valuesByBreakout)
                  .reduce(sumDataValue, 0)
                  .round(1)
                  .value()
              });
            }, {})
            .value()
        });
      }, {})
      .value();

    // generate x axis values
    const categories = _.chain(this.data)
      .groupBy('break_out')
      .keys()
      .sortBy()
      .value();

    // generate data array based on categories (order is important)
    const columns = _.map(groupedData, (value, key) =>
      [key].concat(categories.map((breakout) =>
        value[breakout] || null
      ))
    );

    return {
      data: {
        columns
      },
      axis: {
        x: {
          categories,
          type: 'category'
        }
      }
    };
  }

}
