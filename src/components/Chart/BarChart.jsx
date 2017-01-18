import React, { PropTypes } from 'react';
import _ from 'lodash';
import C3ChartUpdatable from './C3ChartUpdatable';

const BarChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.axis.rotated = true;

  if (_.get(chartConfig, 'axis.x.label')) {
    chartConfig.axis.x.label.position = 'outer-middle';
  }

  if (_.get(chartConfig, 'axis.y.label')) {
    chartConfig.axis.y.label.position = 'outer-center';
  }

  const longDesc = `This chart displays ${desc} as a bar chart. ` +
    `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} title={title} />
  );
};

BarChart.propTypes = {
  chartData: PropTypes.object,
  desc: PropTypes.string,
  title: PropTypes.string
};

export default BarChart;
