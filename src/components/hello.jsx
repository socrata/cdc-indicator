import React, { Component, PropTypes } from 'react';

export default class Hello extends Component {

  componentWillMount() {
    this.props.onChange('Sekai');
  }

  render() {
    return (
      <div>
        Hello, {this.props.indicator}!
      </div>
    );
  }
}

Hello.propTypes = {
  onChange: PropTypes.func.isRequired,
  indicator: PropTypes.string.isRequired
};
