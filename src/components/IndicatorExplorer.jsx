import React, { Component, PropTypes } from 'react';
import * as Charts from '../components/charts';
import DataFilter from '../containers/DataFilter';

import filters from '../config/filters.yml';

export default class IndicatorExplorer extends Component {

  componentWillMount() {
    this.props.loadData(this.props.filter);
  }

  render() {
    return (
      <div>
        <DataFilter filters={filters} />
        <Charts.ColumnChart data={this.props.data} majorAxis="breakout" />
        <Charts.ColumnChart data={this.props.data} majorAxis="year" />
        <Charts.BarChart data={this.props.data} majorAxis="breakout" />
        <Charts.BarChart data={this.props.data} majorAxis="year" />
        <Charts.LineChart data={this.props.data} majorAxis="breakout" />
        <Charts.LineChart data={this.props.data} majorAxis="year" />
      </div>
    );
  }
}

IndicatorExplorer.propTypes = {
  data: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
