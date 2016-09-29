import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3Chart from 'react-c3js';
import 'c3/c3.css';

const PieChart = ({ data }) => {
  // if data is empty, return empty component
  if (data.length === 0) {
    return null;
  }

  const chartConfig = new ChartData(data, 'pie').chartConfig();
  chartConfig.data.type = 'pie';

  return (
    <C3Chart {...chartConfig} />
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired
};

export default PieChart;
