/**
 * Wrapper to load application configurations from a dataset
 */

import React, { Component, PropTypes } from 'react';
import BaseLayout from 'layouts/BaseLayout';
import styles from 'styles/spinner.css';

class App extends Component {
  componentWillMount() {
    // load configuration from a dataset when mounting component
    this.props.loadConfig();
  }

  render() {
    const { coreConfig,
            dataSourceConfig,
            error,
            errorMessage,
            fetching,
            selectedFilters } = this.props;

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
      return (
        <BaseLayout
          config={coreConfig}
          dataSources={dataSourceConfig}
          selectedFilters={selectedFilters}
        />
      );
    }

    return null;
  }
}

App.propTypes = {
  // from redux store
  coreConfig: PropTypes.object,
  dataSourceConfig: PropTypes.object,
  // @TODO pass selected indicator ID
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  fetching: PropTypes.bool,
  loadConfig: PropTypes.func,
  selectedFilters: PropTypes.object
};

export default App;
