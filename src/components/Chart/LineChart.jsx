import React, { PropTypes } from 'react';
import d3 from 'd3';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';

const LineChart = ({ breakoutColumn, data, dataSeries, year }) => {
  const chartConfig = new ChartData({ breakoutColumn, data, dataSeries, year }).chartConfig();
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
  breakoutColumn: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

LineChart.defaultProps = {
  dataSeries: 'trend'
};

export default LineChart;
