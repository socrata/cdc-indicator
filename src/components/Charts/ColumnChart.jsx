import React, { PropTypes } from 'react';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from 'components/C3ChartUpdatable';
import styles from 'styles/spinner.css';

const ColumnChart = ({ data, dataSeries, year }) => {
  // if data is empty, return loading icon div
  if (data.length === 0) {
    return (
      <div className={styles.spinner}>
        <i className="fa fa-circle-o-notch fa-spin"></i>
      </div>
    );
  }

  const chartConfig = new ChartData(data, dataSeries, year).chartConfig();
  chartConfig.data.type = 'bar';
  chartConfig.padding = { bottom: 30 };

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

ColumnChart.propTypes = {
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

ColumnChart.defaultProps = {
  dataSeries: 'trend'
};

export default ColumnChart;
