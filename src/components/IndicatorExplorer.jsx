/**
 * Main content container for top-level application
 */

/** dependencies **/
// vendors
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
// custom
import * as Charts from '../components/Charts';
import DataFilter from '../containers/DataFilter';
import MapDataProvider from '../containers/MapDataProvider';
import { CONFIG } from '../constants';
// styles
import './IndicatorExplorer.css';

/** main class **/
export default class IndicatorExplorer extends Component {

  // data is not loaded on componentWillMount()
  // because filter props are not set on load

  componentWillReceiveProps(nextProps) {
    const { loadData,
            filter } = this.props;

    if (!_.isEqual(nextProps.filter, filter)) {
      loadData(nextProps.filter);
    }
  }

  render() {
    const { data } = this.props;

    return (
      <div className="indicator-explorer-app">
        <DataFilter filters={CONFIG.filters} />
        <div className="row">
          <div className="column-one-third">
            <Charts.Line data={data} majorAxis="year" />
          </div>
          <div className="column-one-third">
            <Charts.Column data={data} majorAxis="breakout" />
          </div>
          <div className="column-one-third">
            <MapDataProvider />
          </div>
        </div>
        <div className="row">
          <div className="column-one-third">
            <Charts.Column data={data} majorAxis="year" />
          </div>
          <div className="column-one-third">
            <Charts.Bar data={data} majorAxis="breakout" />
          </div>
          <div className="column-one-third">
            <Charts.Pie data={data} />
          </div>
        </div>
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
