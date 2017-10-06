import React, { PropTypes } from 'react';
import DataTable from 'components/DataTable';
import ChartData from 'lib/ChartData';
import styles from 'styles/BaseLayout.css';
import 'c3/c3.css';
import BarChart from './BarChart';
import ColumnChart from './ColumnChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import _ from 'lodash';
import d3 from 'd3';


const Chart = ({ config, data, desc, latestYear }) => {
  if (latestYear === -1) {
    return null;
  }

  let dataSeries = config.data || 'trend';
  if (config.type === 'pie') {
    dataSeries = 'pie';
  }

  const chartData = new ChartData({ data, dataSeries, latestYear });
  const yearEnd = chartData.data[0].yearend;

  let title = `${config.title}`;
  // setting title for bar chart
  if (config.data === 'latest') {
    const rangeText = `${latestYear}` !== yearEnd ?
    `${latestYear} - ${yearEnd}` :
    `${latestYear}`;
    title = `${config.title} (${rangeText} Data)`;
  }
  // setting title for trend chart
  if (config.data === 'trend') {
    const range = _.map(chartData.data, (x) => x.year);
    const rangeText = d3.min(range) === d3.max(range) ?
                      `${d3.max(range)}` :
                      `${d3.min(range)} - ${d3.max(range)}`;
    title = `${config.title} (${rangeText} Data)`;
  }

  const chartTitle = (!config.title) ? null :
    <h3 className={styles.chartTitle}>{title}</h3>;
  let chartElement;
  switch (config.type) {
    case 'bar':
      chartElement = <BarChart chartData={chartData} desc={desc} title={title} />;
      break;
    case 'column':
      chartElement = <ColumnChart chartData={chartData} desc={desc} title={title} />;
      break;
    case 'line':
      chartElement = <LineChart chartData={chartData} desc={desc} title={title} />;
      break;
    case 'pie':
      chartElement = <PieChart chartData={chartData} desc={desc} title={title} />;
      break;
    default:
      chartElement = <div>{config.type}</div>;
  }

  const chartFootnote = (!config.footnote) ? null :
    <div className={styles.chartFootnote}>
      <p>{config.footnote}</p>
    </div>;

  return (
    <div>
      {chartTitle}
      <DataTable
        rawData={data}
        showOnlyLatest={config.data !== 'trend'}
        latestYear={latestYear}
      />
      {chartElement}
      {chartFootnote}
    </div>
  );
};

Chart.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
  desc: PropTypes.string,
  latestYear: PropTypes.number
};

export default Chart;
