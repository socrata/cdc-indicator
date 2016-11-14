import React, { PropTypes } from 'react';
import d3 from 'd3';
import C3ChartUpdatable from './C3ChartUpdatable';

const LineChart = ({ chartData }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: false
  };
  chartConfig.axis.y.tick = {
    format: d3.format('.1f')
  };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

LineChart.propTypes = {
  chartData: PropTypes.object
};

export default LineChart;
