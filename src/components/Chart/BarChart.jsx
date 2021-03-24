import React from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import C3ChartUpdatable from './C3ChartUpdatable';

const BarChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.axis.rotated = true;

  if (_get(chartConfig, 'axis.x.label')) {
    chartConfig.axis.x.label.position = 'outer-middle';
  }

  if (_get(chartConfig, 'axis.y.label')) {
    chartConfig.axis.y.label.position = 'outer-center';
  }

  const longDesc = `This chart displays ${desc} as a bar chart. `
    + `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} customTitle={title} />
  );
};

BarChart.propTypes = {
  chartData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  desc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default BarChart;
