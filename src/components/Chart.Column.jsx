import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';
import styles from '../styles/spinner.css';
import 'c3/c3.css';

const ColumnChart = ({ data, majorAxis }) => {
  // if data is empty, return loading icon div
  if (data.length === 0) {
    return (
      <div className={styles.spinner}>
        <i className="fa fa-circle-o-notch fa-spin"></i>
      </div>
    );
  }

  const chartConfig = new ChartData(data, majorAxis).chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

ColumnChart.propTypes = {
  data: PropTypes.array.isRequired,
  majorAxis: PropTypes.oneOf(['year', 'breakout']).isRequired
};

ColumnChart.defaultProps = {
  majorAxis: 'year'
};

export default ColumnChart;
