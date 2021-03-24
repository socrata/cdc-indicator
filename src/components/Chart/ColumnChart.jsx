import React from 'react';
import PropTypes from 'prop-types';
import C3ChartUpdatable from './C3ChartUpdatable';

const ColumnChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  const longDesc = `This chart displays ${desc} as a column chart. `
    + `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} customTitle={title} />
  );
};

ColumnChart.propTypes = {
  chartData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  desc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default ColumnChart;
