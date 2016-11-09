import React, { PropTypes } from 'react';
import d3 from 'd3';
import ChartData from 'lib/ChartData';
import C3ChartUpdatable from 'components/C3ChartUpdatable';
import styles from 'styles/spinner.css';

const LineChart = ({ data, dataSeries, year }) => {
  // if data is empty, return loading icon div
  if (data.length === 0) {
    return (
      <div className={styles.spinner}>
        <i className="fa fa-circle-o-notch fa-spin"></i>
      </div>
    );
  }

  const chartConfig = new ChartData(data, dataSeries, year).chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: false
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
  dataSeries: PropTypes.oneOf(['trend', 'latest']).isRequired,
  year: PropTypes.number.isRequired
};

LineChart.defaultProps = {
  dataSeries: 'trend'
};

export default LineChart;
