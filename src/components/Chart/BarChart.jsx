import React, { PropTypes } from 'react';
import _ from 'lodash';
import C3ChartUpdatable from './C3ChartUpdatable';

const BarChart = ({ chartData }) => {
  const chartConfig = chartData.chartConfig();
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
  chartData: PropTypes.object
};

export default BarChart;
