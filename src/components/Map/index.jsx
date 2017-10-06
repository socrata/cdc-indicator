import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Filters from 'components/Filters';
import DataTable from 'components/DataTable';
import styles from 'styles/map.css';
import Choropleth from './Choropleth';

class Map extends Component {
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
    if (!_.isEqual(nextProps.selectedParentFilters, this.props.selectedParentFilters)) {
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
    const { config,
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
            setMapElement,
            zoomToState } = this.props;

    // only render after config is loaded
    if (fetching) {
      return (
        <div className={styles.spinner}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch"></i>
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
            <i className="fa fa-exclamation-circle"></i>
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

    const chartTitle = (!config.title) ? null :
      <h3 className={styles.chartTitle}>{title}</h3>;

    const chartFootnote = (!config.footnote) ? null :
      <div className={styles.chartFootnote}>
        <p>{config.footnote}</p>
      </div>;

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
          setMapElement={setMapElement}
          zoomToState={zoomToState}
          desc={desc}
          title={title}
        />
        {chartFootnote}
      </div>
    );
  }
}

Map.propTypes = {
  // from redux store
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  fetching: PropTypes.bool,
  filters: PropTypes.array,
  initMap: PropTypes.func,
  isDataReady: PropTypes.bool,
  mapData: PropTypes.object,
  onFilterChange: PropTypes.func,
  onStateClick: PropTypes.func,
  rawData: PropTypes.array,
  selected: PropTypes.object,
  selectedParentFilters: PropTypes.object,
  selectedState: PropTypes.string,
  setMapElement: PropTypes.func,
  zoomToState: PropTypes.func,
  // from props
  config: PropTypes.object,
  desc: PropTypes.string,
  latestYear: PropTypes.number
};

export default Map;
