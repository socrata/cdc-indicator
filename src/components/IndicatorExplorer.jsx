/**
 * Main content container for top-level application
 */

/** dependencies **/
// vendors
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
// custom
import * as Charts from '../components/Charts';
import Grid from '../components/Grid';
import DataFilter from '../containers/DataFilter';
import MapDataProvider from '../containers/MapDataProvider';
// styles
import styles from '../styles/app.css';

/** main class **/
export default class IndicatorExplorer extends Component {

  // data is not loaded on componentWillMount()
  // because filter props are not set on load

  componentWillReceiveProps(nextProps) {
    const { loadData,
            filter } = this.props;

    // load data when filter changed
    if (!_.isEqual(nextProps.filter, filter)) {
      loadData(nextProps.filter, nextProps.config.fromYear);
    }
  }

  render() {
    const { config,
            data,
            label } = this.props;

    const charts = config.chartConfig.map((chart, i) => {
      let chartElement;

      switch (chart.type) {
        case 'bar':
          chartElement = (
            <Charts.Bar
              data={data}
              year={config.latestYear}
              dataSeries={chart.data || 'trend'}
            />
          );
          break;
        case 'column':
          chartElement = (
            <Charts.Column
              data={data}
              year={config.latestYear}
              dataSeries={chart.data || 'trend'}
            />
          );
          break;
        case 'line':
          chartElement = (
            <Charts.Line
              data={data}
              year={config.latestYear}
              dataSeries={chart.data || 'trend'}
            />
          );
          break;
        case 'map':
          chartElement = (
            <MapDataProvider />
          );
          break;
        case 'pie':
          chartElement = (
            <Charts.Pie
              data={data}
              year={config.latestYear}
            />
          );
          break;
        default:
      }

      if (!chartElement) {
        return null;
      }

      const chartTitle = (chart.title) ? (
        <h3 className={styles.chartTitle}>{chart.title}</h3>
      ) : null;

      const chartFootnote = (chart.footnote) ? (
        <p className={styles.chartFootnote}>{chart.footnote}</p>
      ) : null;

      return (
        <div key={i}>
          {chartTitle}
          {chartElement}
          {chartFootnote}
        </div>
      );
    });

    const intro = (config.intro) ? (
      <p className={styles.appIntro}>{config.intro}</p>
    ) : null;

    const footnote = (config.footnote) ? (
      <p className={styles.footnote}>{config.footnote}</p>
    ) : null;

    return (
      <div className="indicator-explorer-app">
        <h1 className={styles.appTitle}>
          {config.title || 'Indicator Explorer'}
        </h1>
        {intro}
        <DataFilter
          filters={config.filterConfig}
          intro={config.filter_intro}
          customClass={styles.mainFilter}
        />
        <h2 className={styles.sectionTitle}>{label.questionid || ''}</h2>
        <Grid customChildClass={styles.chartContainer}>
          {charts}
        </Grid>
        {footnote}
        <h2 className={styles.sectionTitle}>Example of a 2-chart layout</h2>
        <Grid customChildClass={styles.chartContainer}>
          <Charts.Column data={data} dataSeries="latest" year={config.latestYear} />
          <Charts.Pie data={data} year={config.latestYear} />
        </Grid>
        <h2 className={styles.sectionTitle}>Example of a single chart layout</h2>
        <Grid customChildClass={styles.chartContainer}>
          <Charts.Bar data={data} dataSeries="latest" year={config.latestYear} />
        </Grid>
      </div>
    );
  }
}

// props provided by redux - see ../containes/DataProvider
IndicatorExplorer.propTypes = {
  config: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  label: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
