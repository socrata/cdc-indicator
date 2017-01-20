import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Chart from 'components/Chart';
import MapContainer from 'containers/MapContainer';
import Grid from 'layouts/Grid';
import { CONFIG } from 'constants';
import styles from 'styles/spinner.css';

class ChartArea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      oldChartConfiguration: props.chartConfiguration
    };

    this.onChange = (event) => {
      this.props.setCompareFlag(event.target.checked);
      this.props.loadData();
    };
  }

  componentWillMount() {
    // when component will be mounted and filters are already loaded, load data
    if (this.props.isFilterReady) {
      this.props.loadData();
    }
  }

  componentWillReceiveProps(nextProps) {
    // save old chart configurations
    if (this.props.fetching === nextProps.fetching && nextProps.chartConfiguration.length > 0) {
      this.setState({
        oldChartConfiguration: nextProps.chartConfiguration
      });
    }

    // when filter gets loaded (goes from true to false), load data
    if (!this.props.isFilterReady && nextProps.isFilterReady) {
      nextProps.loadData();
    }

    // when new filter is selected, reload data (filter must have been ready before this check)
    if (nextProps.isFilterReady &&
        !_.isEqual(nextProps.selectedFilters, this.props.selectedFilters)) {
      nextProps.loadData();
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.fetching !== nextProps.fetching ||
      this.props.isFilterReady !== nextProps.isFilterReady;
  }

  render() {
    const { chartConfiguration,
            compareToNational,
            customChildClass,
            error,
            errorMessage,
            fetching,
            isFilterReady,
            latestYear,
            rawData,
            selectedFilters } = this.props;

    // only render after filters are ready
    // if (!isFilterReady) {
    //   return <div></div>;
    // }

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

    let renderChartConfiguration = chartConfiguration;

    // render "now loading" message while fetching
    let nowLoadingElement;
    if (fetching || !isFilterReady) {
      renderChartConfiguration = this.state.oldChartConfiguration;
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
    } else if (rawData.length === 0) {
      return (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinnerOverlay}>
            Data not available for selected criteria.
            Please update your selection.
          </div>
        </div>
      );
    }

    const selectedIndicator = _.get(selectedFilters, `${CONFIG.indicatorId}.label`);
    const selectedLocation = _.get(selectedFilters, `${CONFIG.locationId}.label`);
    const selectedDataType = _.get(rawData, '[0].data_value_type');

    const sectionTitle = [selectedIndicator, selectedLocation, selectedDataType]
      .filter(row => row !== undefined && row !== '')
      .join(' – ');

    // display checkbox to indicate whether to include national-level data in charts
    const doesIncludeComparisonChart = renderChartConfiguration.reduce((acc, config) => {
      return acc || config.type === 'bar' || config.type === 'column' || config.type === 'line';
    }, false);

    let compareElement;
    if (doesIncludeComparisonChart &&
        _.get(selectedFilters, `[${CONFIG.locationId}].id`, 'US') !== 'US') {
      compareElement = (
        <label className={styles.compareCheckbox}>
          <input
            type="checkbox"
            checked={compareToNational}
            onChange={this.onChange}
          />
          Compare to U.S. nationwide data if available.
        </label>
      );
    }

    const charts = renderChartConfiguration.map((config, index) => {
      if (config.type === 'map') {
        return (
          <MapContainer
            key={index}
            config={config}
            desc={sectionTitle}
            latestYear={latestYear}
          />
        );
      }

      return (
        <Chart
          key={index}
          config={config}
          data={rawData}
          desc={sectionTitle}
          latestYear={latestYear}
        />
      );
    });

    return (
      <div>
        <h2>
          {sectionTitle}
        </h2>
        <div className={styles.spinnerContainer}>
          {nowLoadingElement}
          {compareElement}
          <Grid customChildClass={customChildClass}>
            {charts}
          </Grid>
        </div>
      </div>
    );
  }
}

ChartArea.propTypes = {
  // from props
  customChildClass: PropTypes.string,
  // from redux store
  chartConfiguration: PropTypes.array,
  compareToNational: PropTypes.bool,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  fetching: PropTypes.bool,
  isFilterReady: PropTypes.bool,
  latestYear: PropTypes.number,
  loadData: PropTypes.func,
  rawData: PropTypes.array,
  selectedFilters: PropTypes.object,
  setCompareFlag: PropTypes.func
};

ChartArea.defaultProps = {
  chartConfiguration: []
};

export default ChartArea;
