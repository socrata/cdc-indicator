import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import Chart from 'components/Chart';
import MapContainer from 'containers/MapContainer';
import Grid from 'components/Grid';
import { fetchData, setCompareFlag as setCompareFlagFn } from 'modules/indicatorData';
import { CONFIG } from 'constants/index';
import styles from 'styles/spinner.css';

class ChartsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      oldChartConfiguration: props.chartConfiguration
    };

    this.onChange = (event) => {
      const { loadData, setCompareFlag } = this.props;
      setCompareFlag(event.target.checked);
      loadData();
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { isFilterReady, loadData } = this.props;
    // when component will be mounted and filters are already loaded, load data
    if (isFilterReady) {
      loadData();
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { fetching, isFilterReady, selectedFilters } = this.props;

    // save old chart configurations
    if (fetching === nextProps.fetching && nextProps.chartConfiguration.length > 0) {
      this.setState({
        oldChartConfiguration: nextProps.chartConfiguration
      });
    }

    // when filter gets loaded (goes from true to false), load data
    if (!isFilterReady && nextProps.isFilterReady) {
      nextProps.loadData();
    }

    // when new filter is selected, reload data (filter must have been ready before this check)
    if (nextProps.isFilterReady
      && !_isEqual(nextProps.selectedFilters, selectedFilters)) {
      nextProps.loadData();
    }
  }

  shouldComponentUpdate(nextProps) {
    const { fetching, isFilterReady } = this.props;
    return fetching !== nextProps.fetching
      || isFilterReady !== nextProps.isFilterReady;
  }

  render() {
    const {
      chartConfiguration,
      compareToNational,
      customChildClass,
      customParentClass,
      error,
      errorMessage,
      fetching,
      isFilterReady,
      latestYear,
      rawData,
      selectedFilters
    } = this.props;

    const {
      oldChartConfiguration
    } = this.state;

    // only render after filters are ready
    // if (!isFilterReady) {
    //   return <div></div>;
    // }

    // display error message if something went wrong
    if (error) {
      return (
        <div className={styles.spinner}>
          <p>
            <i className="fa fa-exclamation-circle" />
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
      renderChartConfiguration = oldChartConfiguration;
      nowLoadingElement = (
        <div className={styles.spinnerOverlay}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch" />
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

    const selectedIndicator = _get(selectedFilters, `${CONFIG.indicatorId}.label`);
    const selectedLocation = _get(selectedFilters, `${CONFIG.locationId}.label`);
    const selectedDataType = _get(rawData, '[0].data_value_type');

    const sectionTitle = [selectedIndicator, selectedLocation, selectedDataType]
      .filter((row) => row !== undefined && row !== '')
      .join(' – ');

    // display checkbox to indicate whether to include national-level data in charts
    const doesIncludeComparisonChart = renderChartConfiguration.reduce((acc, config) => (
      acc || config.type === 'bar' || config.type === 'column' || config.type === 'line'
    ), false);

    let compareElement;
    if (doesIncludeComparisonChart
      && _get(selectedFilters, `[${CONFIG.locationId}].id`, 'US') !== 'US') {
      // <input> is enclosed in <label>, but eslint does not recognize this
      /* eslint-disable jsx-a11y/label-has-for */
      /* eslint-disable jsx-a11y/label-has-associated-control */
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
      /* eslint-enable jsx-a11y/label-has-associated-control */
      /* eslint-enable jsx-a11y/label-has-for */
    }

    const charts = renderChartConfiguration.map((config) => {
      if (config.type === 'map') {
        return (
          <MapContainer
            key={`${config.type}_${config.title}`}
            config={config}
            desc={sectionTitle}
            latestYear={latestYear}
          />
        );
      }

      return (
        <Chart
          key={`${config.type}_${config.title}`}
          config={config}
          data={rawData}
          desc={sectionTitle}
          latestYear={latestYear}
        />
      );
    });

    return (
      <div>
        <h2 style={{ lineHeight: 1.2 }}>
          {sectionTitle}
        </h2>
        <div className={styles.spinnerContainer}>
          {nowLoadingElement}
          {compareElement}
          <Grid customClassParent={customParentClass} customClassChildren={customChildClass}>
            {charts}
          </Grid>
        </div>
      </div>
    );
  }
}

ChartsContainer.propTypes = {
  customChildClass: PropTypes.string,
  customParentClass: PropTypes.string,
  // Redux states
  chartConfiguration: PropTypes.arrayOf(PropTypes.shape({
    data: PropTypes.string,
    footnote: PropTypes.string,
    indicator: PropTypes.string,
    published: PropTypes.bool,
    sort: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string
  })).isRequired,
  compareToNational: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  isFilterReady: PropTypes.bool.isRequired,
  latestYear: PropTypes.number.isRequired,
  rawData: PropTypes.arrayOf(PropTypes.shape({
    data_value: PropTypes.number,
    data_value_type: PropTypes.string,
    data_value_unit: PropTypes.string,
    high_confidence_limit: PropTypes.number,
    low_confidence_limit: PropTypes.number,
    year: PropTypes.number
  })).isRequired,
  selectedFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  // Redux dispatches
  loadData: PropTypes.func.isRequired,
  setCompareFlag: PropTypes.func.isRequired
};

ChartsContainer.defaultProps = {
  customChildClass: undefined,
  customParentClass: undefined
};

const mapStateToProps = (state) => {
  // determine the correct "chart" configuration to use for a selected indicator
  let chartConfiguration = [];

  if (!state.filters.fetching) {
    const indicator = _get(state, `filters.selected[${CONFIG.indicatorId}].id`, 'default');
    const charts = _get(state, 'appConfig.config.chart', {});

    if (Object.prototype.hasOwnProperty.call(charts, indicator)) {
      chartConfiguration = (charts[indicator] || []).slice(0, 3);
    } else {
      chartConfiguration = (charts.default || []).slice(0, 3);
    }
  }

  return {
    chartConfiguration,
    compareToNational: _get(state, 'indicatorData.compareToNational'),
    error: _get(state, 'indicatorData.error'),
    errorMessage: _get(state, 'indicatorData.errorMessage'),
    fetching: _get(state, 'indicatorData.fetching'),
    isFilterReady: !_get(state, 'filters.fetching') && !_get(state, 'filters.error'),
    latestYear: _get(state, 'indicatorData.latestYear'),
    rawData: _get(state, 'indicatorData.data'),
    selectedFilters: _get(state, 'filters.selected')
  };
};

const mapDispatchToProps = (dispatch) => ({
  loadData: () => {
    dispatch(fetchData());
  },
  setCompareFlag: (status) => {
    dispatch(setCompareFlagFn(status));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ChartsContainer);
