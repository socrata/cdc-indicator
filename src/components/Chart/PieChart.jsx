import React, { PropTypes } from 'react';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';

const PieChart = ({ breakoutColumn, data, dataSeries, year }) => {
  const chartConfig = new ChartData({ breakoutColumn, data, dataSeries, year }).chartConfig();
  chartConfig.data.type = 'pie';

  return (
    <C3ChartUpdatable year={year} {...chartConfig} />
  );
};

PieChart.propTypes = {
  breakoutColumn: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired
};

PieChart.defaultProps = {
  dataSeries: 'pie'
};

export default PieChart;
