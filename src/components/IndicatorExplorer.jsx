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
    const { data } = this.props;

    return (
      <div className="indicator-explorer-app">
        <DataFilter filters={CONFIG.filters} />
        <Grid>
          <Charts.Line data={data} majorAxis="year" />
          <Charts.Column data={data} majorAxis="breakout" />
          <MapDataProvider />
        </Grid>
        <Grid>
          <Charts.Column data={data} majorAxis="year" />
          <Charts.Pie data={data} />
        </Grid>
        <Grid>
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
  loadData: PropTypes.func.isRequired
};
