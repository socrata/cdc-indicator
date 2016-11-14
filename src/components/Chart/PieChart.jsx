import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';

const PieChart = ({ chartData }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'pie';

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

PieChart.propTypes = {
  chartData: PropTypes.object
};

export default PieChart;
