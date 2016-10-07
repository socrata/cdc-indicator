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
import { CONFIG } from '../constants';
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
      loadData(nextProps.filter);
    }
  }

  render() {
    const { data,
            label } = this.props;

    return (
      <div className="indicator-explorer-app">
        <h1 className={styles.appTitle}>Indicator Explorer</h1>
        <DataFilter
          filters={CONFIG.filters}
          customClass={styles.mainFilter}
        />
        <h2 className={styles.sectionTitle}>{label.questionid || ''}</h2>
        <Grid customChildClass={styles.chartContainer}>
          <Charts.Line data={data} majorAxis="year" />
          <Charts.Column data={data} majorAxis="breakout" />
          <MapDataProvider />
        </Grid>
        <h2 className={styles.sectionTitle}>Example of a 2-chart layout</h2>
        <Grid customChildClass={styles.chartContainer}>
          <Charts.Column data={data} majorAxis="breakout" />
          <Charts.Pie data={data} />
        </Grid>
        <h2 className={styles.sectionTitle}>Example of a single chart layout</h2>
        <Grid customChildClass={styles.chartContainer}>
          <Charts.Bar data={data} majorAxis="breakout" />
        </Grid>
      </div>
    );
  }
}

// props provided by redux - see ../containes/DataProvider
IndicatorExplorer.propTypes = {
  data: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  label: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
