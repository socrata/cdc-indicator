import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Chart from 'components/Chart';
import MapContainer from 'containers/MapContainer';
import Grid from 'layouts/Grid';
import styles from 'styles/spinner.css';

export default class ChartArea extends Component {
  static propTypes = {
    // from props
    customChildClass: PropTypes.string,
    // from redux store
    chartConfiguration: PropTypes.array,
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    fetching: PropTypes.bool,
    isFilterReady: PropTypes.bool,
    latestYear: PropTypes.number,
    loadData: PropTypes.func,
    rawData: PropTypes.array,
    selectedFilters: PropTypes.object
  };

  componentWillMount() {
    // when component will be mounted and filters are already loaded, load data
    if (this.props.isFilterReady) {
      this.props.loadData();
    }
  }

  componentWillReceiveProps(nextProps) {
    // when filter gets loaded (goes from true to false), load data
    if (!this.props.isFilterReady && nextProps.isFilterReady) {
      nextProps.loadData();
    }

    // when new filter is selected, reload data (filter must have been ready before this check)
    if (this.props.isFilterReady &&
        !_.isEqual(nextProps.selectedFilters, this.props.selectedFilters)) {
      nextProps.loadData();
    }
  }

  render() {
    const { chartConfiguration,
            customChildClass,
            error,
            errorMessage,
            fetching,
            isFilterReady,
            latestYear,
            rawData } = this.props;

    // only render after filters are ready
    if (!isFilterReady) {
      return <div></div>;
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

    // render "now loading" message while fetching
    let nowLoadingElement;
    if (fetching) {
      nowLoadingElement = (
        <div className={styles.spinnerOverlay}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch"></i>
          </p>
          <p>
            Loading data...
          </p>
        </div>
      );
    }

    if (rawData.length === 0) {
      return (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinnerOverlay}>
            Data not available for selected criteria.
            Please update your selection.
          </div>
        </div>
      );
    }

    const charts = chartConfiguration.map((config, index) => {
      if (config.type === 'map') {
        return (
          <MapContainer
            key={index}
            config={config}
            latestYear={latestYear}
          />
        );
      }

      return (
        <Chart
          key={index}
          config={config}
          data={rawData}
          latestYear={latestYear}
        />
      );
    });

    return (
      <div className={styles.spinnerContainer}>
        {nowLoadingElement}
        <Grid customChildClass={customChildClass}>
          {charts}
        </Grid>
      </div>
    );
  }
}
