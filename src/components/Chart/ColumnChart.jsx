import React, { PropTypes } from 'react';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';

const ColumnChart = ({ breakoutColumn, data, dataSeries, year }) => {
  const chartConfig = new ChartData({ breakoutColumn, data, dataSeries, year }).chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

ColumnChart.propTypes = {
  breakoutColumn: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

ColumnChart.defaultProps = {
  dataSeries: 'trend'
};

export default ColumnChart;
