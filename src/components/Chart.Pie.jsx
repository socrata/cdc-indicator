import React, { PropTypes } from 'react';
import ChartData from '../lib/ChartData';
import C3ChartUpdatable from './C3ChartUpdatable';
import d3 from 'd3';
import styles from '../styles/spinner.css';
import 'c3/c3.css';

const PieChart = ({ data, year }) => {
  // if data is empty, return loading icon div
  if (data.length === 0) {
    return (
      <div className={styles.spinner}>
        <i className="fa fa-circle-o-notch fa-spin"></i>
      </div>
    );
  }

  const chartConfig = new ChartData(data, 'pie', year).chartConfig();
  chartConfig.data.type = 'pie';
  chartConfig.tooltip = {
    format: {
      value: (value, ratio) => {
        return `${value} (${d3.format('.1%')(ratio)})`;
      }
    }
  };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  year: PropTypes.number.isRequired
};

export default PieChart;
