import React, { PropTypes } from 'react';
import d3 from 'd3';
import C3ChartUpdatable from './C3ChartUpdatable';

const LineChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: false
  };
  chartConfig.axis.y.tick = {
    format: d3.format('.1f')
  };

  const longDesc = `This chart displays ${desc} as a line chart. ` +
    `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} title={title} />
  );
};

LineChart.propTypes = {
  chartData: PropTypes.object,
  desc: PropTypes.string,
  title: PropTypes.string
};

export default LineChart;
