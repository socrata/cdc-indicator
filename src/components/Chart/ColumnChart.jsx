import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';

const ColumnChart = ({ chartData }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

ColumnChart.propTypes = {
  chartData: PropTypes.object
};

export default ColumnChart;
