import React, { PropTypes } from 'react';
import DataTable from 'components/DataTable';
import ChartData from 'lib/ChartData';
import styles from 'styles/BaseLayout.css';
import 'c3/c3.css';
import BarChart from './BarChart';
import ColumnChart from './ColumnChart';
import LineChart from './LineChart';
import PieChart from './PieChart';

const Chart = ({
  breakoutColumn,
  breakoutLabelColumn,
  config,
  data,
  latestYear,
  locationColumn,
  locationLabelColumn
}) => {
  let dataSeries = config.data || 'trend';
  if (config.type === 'pie') {
    dataSeries = 'pie';
  }

  const chartData = new ChartData({
    breakoutColumn,
    breakoutLabelColumn,
    data,
    dataSeries,
    latestYear,
    locationColumn,
    locationLabelColumn
  });

  let chartElement;
  switch (config.type) {
    case 'bar':
      chartElement = <BarChart chartData={chartData} />;
      break;
    case 'column':
      chartElement = <ColumnChart chartData={chartData} />;
      break;
    case 'line':
      chartElement = <LineChart chartData={chartData} />;
      break;
    case 'pie':
      chartElement = <PieChart chartData={chartData} />;
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
        data={data}
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
  breakoutLabelColumn: PropTypes.string,
  config: PropTypes.object,
  data: PropTypes.array,
  latestYear: PropTypes.number,
  locationColumn: PropTypes.string,
  locationLabelColumn: PropTypes.string
};

export default Chart;
