import React, { Component, PropTypes } from 'react';
import * as Charts from '../components/Charts';
import MapDataProvider from '../containers/MapDataProvider';
import DataFilter from '../containers/DataFilter';

import filters from '../config/filters.yml';

export default class IndicatorExplorer extends Component {

  componentWillMount() {
    const { loadData,
            filter } = this.props;

    loadData(filter);
  }

  render() {
    const { data } = this.props;

    return (
      <div>
        <DataFilter filters={filters} />
        <Charts.Column data={data} majorAxis="breakout" />
        <Charts.Column data={data} majorAxis="year" />
        <Charts.Bar data={data} majorAxis="breakout" />
        <Charts.Bar data={data} majorAxis="year" />
        <Charts.Line data={data} majorAxis="breakout" />
        <Charts.Line data={data} majorAxis="year" />
        <Charts.Pie data={data} />
        <MapDataProvider />
      </div>
    );
  }
}

IndicatorExplorer.propTypes = {
  data: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
