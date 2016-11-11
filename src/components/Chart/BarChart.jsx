import React, { PropTypes } from 'react';
import _ from 'lodash';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';

const BarChart = ({ breakoutColumn, data, dataSeries, year }) => {
  const chartConfig = new ChartData({ breakoutColumn, data, dataSeries, year }).chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.axis.rotated = true;

  if (_.get(chartConfig, 'axis.x.label')) {
    chartConfig.axis.x.label.position = 'outer-middle';
  }

  if (_.get(chartConfig, 'axis.y.label')) {
    chartConfig.axis.y.label.position = 'outer-center';
  }

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

BarChart.propTypes = {
  breakoutColumn: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

BarChart.defaultProps = {
  dataSeries: 'trend'
};

export default BarChart;
