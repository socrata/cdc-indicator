import React, { Component, PropTypes } from 'react';
import C3Chart from 'react-c3js';
import Test from '../containers/Test';
import 'c3/c3.css';

export default class IndicatorExplorer extends Component {

  componentWillMount() {
    this.props.onLoad();
  }

  render() {
    return (
      <div>
        <Test />
        <C3Chart data={this.props.data} />
      </div>
    );
  }
}

IndicatorExplorer.propTypes = {
  data: PropTypes.object.isRequired,
  onLoad: PropTypes.func.isRequired
};
