import React, { PropTypes } from 'react';
import _ from 'lodash';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from 'components/C3ChartUpdatable';
import styles from 'styles/spinner.css';

const BarChart = ({ data, dataSeries, year }) => {
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
  chartConfig.axis.rotated = true;

  if (_.get(chartConfig, 'axis.x.label')) {
    chartConfig.axis.x.label.position = 'outer-middle';
  }

  if (_.get(chartConfig, 'axis.y.label')) {
    chartConfig.axis.y.label.position = 'outer-center';
  }

  return (
    <C3ChartUpdatable {...chartConfig} />
  );
};

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

BarChart.defaultProps = {
  dataSeries: 'trend'
};

export default BarChart;
