/**
 * Wrapper to load application configurations from a dataset
 */

import React, { Component, PropTypes } from 'react';
import BaseLayout from 'layout/BaseLayout';
import styles from 'styles/spinner.css';

export default class App extends Component {
  static propTypes = {
    // from redux store
    coreConfig: PropTypes.object,
    dataSourceConfig: PropTypes.object,
    // @TODO pass selected indicator ID
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    fetching: PropTypes.bool,
    loadConfig: PropTypes.func
  };

  componentWillMount() {
    // load configuration from a dataset when mounting component
    this.props.loadConfig();
  }

  render() {
    const { coreConfig,
            dataSourceConfig,
            error,
            errorMessage,
            fetching } = this.props;

    // only render after config is loaded
    if (fetching) {
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

    // display error message if something went wrong
    if (error) {
      return (
        <div className={styles.spinner}>
          <p>
            <i className="fa fa-exclamation-circle"></i>
          </p>
          <p>
            {errorMessage}
          </p>
        </div>
      );
    }

    if (!fetching && !error) {
      return <BaseLayout config={coreConfig} dataSources={dataSourceConfig} />;
    }

    return null;
  }
}
