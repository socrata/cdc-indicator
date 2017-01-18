import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';

const ColumnChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  const longDesc = `This chart displays ${desc} as a column chart. ` +
    `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} title={title} />
  );
};

ColumnChart.propTypes = {
  chartData: PropTypes.object,
  desc: PropTypes.string,
  title: PropTypes.string
};

export default ColumnChart;
