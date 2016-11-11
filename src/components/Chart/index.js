import React, { PropTypes } from 'react';
import DataTable from 'components/DataTable';
import BarChart from './BarChart';
import ColumnChart from './ColumnChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import styles from 'styles/BaseLayout.css';
import 'c3/c3.css';

const Chart = ({ breakoutColumn, config, latestYear, rawData }) => {
  let chartElement;
  switch (config.type) {
    case 'bar':
      chartElement = (
        <BarChart
          breakoutColumn={breakoutColumn}
          data={rawData}
          year={latestYear}
          dataSeries={config.data || 'trend'}
        />
      );
      break;
    case 'column':
      chartElement = (
        <ColumnChart
          breakoutColumn={breakoutColumn}
          data={rawData}
          year={latestYear}
          dataSeries={config.data || 'trend'}
        />
      );
      break;
    case 'line':
      chartElement = (
        <LineChart
          breakoutColumn={breakoutColumn}
          data={rawData}
          year={latestYear}
          dataSeries={config.data || 'trend'}
        />
      );
      break;
    case 'pie':
      chartElement = (
        <PieChart
          breakoutColumn={breakoutColumn}
          data={rawData}
          year={latestYear}
        />
      );
      break;
    default:
      chartElement = <div>{config.type}</div>;
  }

  const title = (config.data === 'latest') ?
    `${config.title} (${latestYear} Data)` :
    config.title;

  const chartTitle = (!config.title) ? null :
    <h3 className={styles.chartTitle}>{title}</h3>;

  const chartFootnote = (!config.footnote) ? null :
    <div className={styles.chartFootnote}>
      <p>{config.footnote}</p>
    </div>;

  return (
    <div>
      {chartTitle}
      <DataTable
        breakoutColumn={breakoutColumn}
        data={rawData}
        dataSeries={config.data || 'trend'}
        chartType={config.type}
        year={latestYear}
      />
      {chartElement}
      {chartFootnote}
    </div>
  );
};

Chart.propTypes = {
  breakoutColumn: PropTypes.string,
  config: PropTypes.object,
  latestYear: PropTypes.number,
  rawData: PropTypes.array
};

export default Chart;
