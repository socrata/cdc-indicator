import React, { PropTypes } from 'react';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from 'components/C3ChartUpdatable';
import styles from 'styles/spinner.css';

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

  return (
    <C3ChartUpdatable year={year} {...chartConfig} />
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  year: PropTypes.number.isRequired
};

export default PieChart;
