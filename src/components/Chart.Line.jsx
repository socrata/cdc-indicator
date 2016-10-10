import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';
import d3 from 'd3';
import styles from '../styles/spinner.css';
import 'c3/c3.css';

const LineChart = ({ data, dataSeries }) => {
  // if data is empty, return loading icon div
  if (data.length === 0) {
    return (
      <div className={styles.spinner}>
        <i className="fa fa-circle-o-notch fa-spin"></i>
      </div>
    );
  }

  const chartConfig = new ChartData(data, dataSeries).chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: true
  };
  chartConfig.axis.y.tick = {
    format: d3.format('.1f')
  };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired
};

LineChart.defaultProps = {
  dataSeries: 'trend'
};

export default LineChart;
