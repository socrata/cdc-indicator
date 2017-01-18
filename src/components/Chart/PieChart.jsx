import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';

const PieChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'pie';

  const longDesc = `This chart displays ${desc} as a pie chart. ` +
    `${chartData.xValues} values are displayed as slices.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} title={title} />
  );
};

PieChart.propTypes = {
  chartData: PropTypes.object,
  desc: PropTypes.string,
  title: PropTypes.string
};

export default PieChart;
