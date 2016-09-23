import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3Chart from 'react-c3js';
import 'c3/c3.css';

const ColumnChart = ({ data, majorAxis }) => {
  // if data is empty, return empty component
  if (data.length === 0) {
    return null;
  }

  const chartConfig = new ChartData(data, majorAxis).chartConfig();
  chartConfig.data.type = 'bar';

  return (
    <C3Chart {...chartConfig} />
  );
};

ColumnChart.propTypes = {
  data: PropTypes.array.isRequired,
  majorAxis: PropTypes.oneOf(['year', 'breakout']).isRequired
};

ColumnChart.defaultProps = {
  majorAxis: 'year'
};

export default ColumnChart;
