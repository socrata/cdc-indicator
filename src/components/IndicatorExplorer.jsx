import React, { Component, PropTypes } from 'react';
import * as Charts from '../components/Charts';
import MapDataProvider from '../containers/MapDataProvider';
import DataFilter from '../containers/DataFilter';
import _ from 'lodash';

import filters from '../config/filters.yml';

import './IndicatorExplorer.css';

export default class IndicatorExplorer extends Component {

  componentWillMount() {
    const { loadData,
            filter } = this.props;

    loadData(filter);
  }

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
        <DataFilter filters={filters} />
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

IndicatorExplorer.propTypes = {
  data: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
