import React from 'react';
import PropTypes from 'prop-types';
import C3ChartUpdatable from './C3ChartUpdatable';

const PieChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'pie';

  const longDesc = `This chart displays ${desc} as a pie chart. ` +
    `${chartData.xValues} values are displayed as slices.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} customTitle={title} />
  );
};

PieChart.propTypes = {
  chartData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  desc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default PieChart;
