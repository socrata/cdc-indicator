import React, { Component } from 'react';

export default class Hello extends Component {

  shouldComponentMount() {
    return false;
  }

  render() {
    return (
      <div>
        Hello, {this.props.name}!
      </div>
    );
  }
}

Hello.defaultProps = {
  name: 'World'
};

Hello.propTypes = {
  name: React.PropTypes.string.isRequired
};
