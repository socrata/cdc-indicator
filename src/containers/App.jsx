/**
 * Wrapper to load application configurations from a dataset
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import {
  fetchConfig,
  createDesktopViewActivated,
  createMobileViewActivated
} from 'modules/appConfig';
import LoadingSpinner from 'components/LoadingSpinner';
import ErrorMessage from 'components/ErrorMessage';
import BaseLayout from 'components/BaseLayout';
import { DESKTOP_BREAKPOINT } from 'constants/index';

class App extends Component {
  componentWillMount() {
    // load configuration from a dataset when mounting component
    this.props.loadConfig();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensionsCallback);
    this.updateDimensionsCallback(); // can call it to set the initial width
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensionsCallback);
  }

  updateDimensionsCallback = () => {
    const { width } = this.containerDivRef.getBoundingClientRect();
    // only fire the action if the view isn't already set as desktop or not desktop
    if (!this.props.isDesktopView && width >= DESKTOP_BREAKPOINT) {
      this.props.setViewAsDesktop();
    } else if (this.props.isDesktopView && width < DESKTOP_BREAKPOINT) {
      this.props.setViewAsMobile();
    }
  };

  render() {
    const {
      coreConfig,
      dataSourceConfig,
      error,
      errorMessage,
      fetching,
      selectedFilters
    } = this.props;

    let contentElement;

    // only render after config is loaded
    if (fetching) {
      contentElement = <LoadingSpinner text="Loading Visualizations..." />;
    } else if (error) {
    // display error message if something went wrong
      contentElement = <ErrorMessage text={errorMessage} />;
    } else {
      contentElement = (
        <BaseLayout
          config={coreConfig}
          dataSources={dataSourceConfig}
          selectedFilters={selectedFilters}
        />
      );
    }

    return (
      <div ref={(el) => { this.containerDivRef = el; }}>
        {contentElement}
      </div>
    );
  }
}

App.propTypes = {
  // Redux states
  coreConfig: PropTypes.shape({
    data_points: PropTypes.string,
    footnote: PropTypes.string,
    source_data_label: PropTypes.string,
    source_system_label: PropTypes.string,
    title: PropTypes.string
  }).isRequired,
  dataSourceConfig: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  isDesktopView: PropTypes.bool.isRequired,
  selectedFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  // Redux dispatch
  loadConfig: PropTypes.func.isRequired,
  setViewAsDesktop: PropTypes.func.isRequired,
  setViewAsMobile: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  coreConfig: _get(state, 'appConfig.config.core'),
  dataSourceConfig: _get(state, 'appConfig.config.dataSource'),
  error: _get(state, 'appConfig.error'),
  errorMessage: _get(state, 'appConfig.errorMessage'),
  fetching: _get(state, 'appConfig.fetching'),
  isDesktopView: _get(state, 'appConfig.isDesktopView'),
  selectedFilters: _get(state, 'filters.selected')
});

const mapDispatchToProps = dispatch => ({
  loadConfig: () => {
    dispatch(fetchConfig());
  },
  setViewAsDesktop: () => {
    dispatch(createDesktopViewActivated());
  },
  setViewAsMobile: () => {
    dispatch(createMobileViewActivated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
