/**
 * Wrapper to load application configurations from a dataset
 */

// vendors
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
// custom
import DataProvider from '../containers/DataProvider'; // renders IndicatorExplorer
// styles
import styles from '../styles/spinner.css';

export default class App extends Component {
  componentWillMount() {
    // load configuration from a dataset when mounting component
    this.props.loadConfig();
  }

  render() {
    const { config } = this.props;

    // only render <DataProvider> after config is loaded
    if (_.isEmpty(config)) {
      return (
        <div className={styles.spinner}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch"></i>
          </p>
          <p>
            Loading Visualizations...
          </p>
        </div>
      );
    }

    return <DataProvider />;
  }
}

App.propTypes = {
  config: PropTypes.object,
  loadConfig: PropTypes.func.isRequired
};
