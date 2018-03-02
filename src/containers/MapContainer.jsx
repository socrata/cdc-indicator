import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _omit from 'lodash/omit';
import {
  initMapContainer,
  setMapFilterAndFetchData,
  setMapElement,
  setStateFilter,
  zoomToState
} from 'modules/map';
import Filters from 'components/Filters';
import DataTable from 'containers/DataTable';
import Choropleth from 'components/Map/Choropleth';
import { CONFIG } from 'constants/index';
import styles from 'styles/Map.scss';

class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      didFilterChange: true
    };
  }

  componentDidMount() {
    if (this.props.isDataReady) {
      this.props.initMap();
    }
  }

  componentWillReceiveProps(nextProps) {
    // if filter (other than location) changed, get ready to re-init map
    if (!_isEqual(nextProps.selectedParentFilters, this.props.selectedParentFilters)) {
      this.setState({
        didFilterChange: true
      });
    }

    // reinitialize map when data is ready (new 'latestYear' is ready)
    if (!this.props.isDataReady && nextProps.isDataReady && this.state.didFilterChange) {
      this.props.initMap();
      this.setState({
        didFilterChange: false
      });
    }
  }

  render() {
    const {
      config,
      desc,
      error,
      errorMessage,
      fetching,
      filters,
      latestYear,
      mapData,
      onFilterChange,
      onStateClick,
      rawData,
      selected,
      selectedState,
      setMapElementFn,
      zoomToStateFn
    } = this.props;

    // only render after config is loaded
    if (fetching) {
      return (
        <div className={styles.spinner}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch" />
          </p>
          <p>
            Loading Map...
          </p>
        </div>
      );
    }

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

    let filterElement;
    if (filters.length > 0) {
      filterElement = (
        <Filters
          customClass={styles.mapFilter}
          error={false}
          fetching={false}
          filters={filters}
          // intro={}
          onFilterChange={onFilterChange}
          selected={selected}
        />
      );
    }

    let title = `${config.title}`;
    const yearEnd = rawData[0].yearend;
    if (`${latestYear}` !== yearEnd) {
      title = `${config.title} (${latestYear} - ${yearEnd} Data)`;
    } else {
      title = `${config.title} (${latestYear} Data)`;
    }

    const chartTitle = (!config.title) ? null : <h3 className={styles.chartTitle}>{title}</h3>;

    const chartFootnote = (!config.footnote)
      ? null
      : (
        <div className={styles.chartFootnote}>
          <p>{config.footnote}</p>
        </div>
      );

    return (
      <div>
        {chartTitle}
        <DataTable rawData={rawData} isForMap />
        {filterElement}
        <Choropleth
          data={mapData}
          year={latestYear}
          onClick={onStateClick}
          selectedState={selectedState}
          setMapElement={setMapElementFn}
          zoomToState={zoomToStateFn}
          desc={desc}
          title={title}
        />
        {chartFootnote}
      </div>
    );
  }
}

MapContainer.propTypes = {
  // props
  config: PropTypes.shape({
    data_points: PropTypes.string,
    footnote: PropTypes.string,
    source_data_label: PropTypes.string,
    source_system_label: PropTypes.string,
    title: PropTypes.string
  }).isRequired,
  desc: PropTypes.string.isRequired,
  latestYear: PropTypes.number.isRequired,
  // Redux states
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isDataReady: PropTypes.bool.isRequired,
  mapData: PropTypes.shape({
    features: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string
  }).isRequired,
  rawData: PropTypes.arrayOf(PropTypes.shape({
    data_value: PropTypes.number,
    data_value_type: PropTypes.string,
    data_value_unit: PropTypes.string,
    high_confidence_limit: PropTypes.number,
    low_confidence_limit: PropTypes.number,
    year: PropTypes.number
  })).isRequired,
  selected: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedParentFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedState: PropTypes.string.isRequired,
  // Redux dispatches
  initMap: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onStateClick: PropTypes.func.isRequired,
  setMapElementFn: PropTypes.func.isRequired,
  zoomToStateFn: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  const selectedState = _get(state, `filters.selected.${CONFIG.locationId}.id`);

  return {
    error: state.map.error,
    errorMessage: state.map.errorMessage,
    fetching: state.map.fetching,
    filters: state.map.filterData,
    isDataReady: !state.indicatorData.fetching && !state.indicatorData.error,
    mapData: state.map.data,
    rawData: state.map.rawData,
    selected: state.map.filterSelected,
    selectedParentFilters: _omit(state.filters.selected, CONFIG.locationId),
    selectedState
  };
};

const mapDispatchToProps = dispatch => ({
  initMap: () => {
    dispatch(initMapContainer());
  },
  onFilterChange: (event) => {
    const index = event.nativeEvent.target.selectedIndex;
    dispatch(setMapFilterAndFetchData({
      [event.target.name]: {
        id: event.target.value,
        label: event.nativeEvent.target[index].text
      }
    }));
  },
  onStateClick: (abbreviation, state) => {
    dispatch(setStateFilter(abbreviation, state));
  },
  setMapElementFn: (element) => {
    dispatch(setMapElement(element));
  },
  zoomToStateFn: (state) => {
    dispatch(zoomToState(state));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer);
