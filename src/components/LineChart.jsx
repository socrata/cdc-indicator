import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3Chart from 'react-c3js';
import d3 from 'd3';
import 'c3/c3.css';

const LineChart = ({ data, majorAxis }) => {
  // if data is empty, return empty component
  if (data.length === 0) {
    return null;
  }

  const chartConfig = new ChartData(data, majorAxis).chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: true
  };
  chartConfig.axis.y = {
    tick: {
      format: d3.format('.1f')
    }
  };

  return (
    <C3Chart {...chartConfig} />
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  majorAxis: PropTypes.oneOf(['year', 'breakout']).isRequired
};

LineChart.defaultProps = {
  majorAxis: 'year'
};

export default LineChart;
