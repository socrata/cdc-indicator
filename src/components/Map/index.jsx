import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Filters from 'components/Filters';
import DataTable from 'components/DataTable';
import styles from 'styles/map.css';
import Choropleth from './Choropleth';

export default class Map extends Component {
  static propTypes = {
    // from redux store
    breakoutColumn: PropTypes.string,
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    fetching: PropTypes.bool,
    filters: PropTypes.array,
    initMap: PropTypes.func,
    mapData: PropTypes.object,
    onFilterChange: PropTypes.func,
    onStateClick: PropTypes.func,
    selected: PropTypes.object,
    selectedParentFilters: PropTypes.object,
    setMapElement: PropTypes.func,
    // from props
    config: PropTypes.object,
    latestYear: PropTypes.number
  };

  componentDidMount() {
    this.props.initMap();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.selectedParentFilters, this.props.selectedParentFilters)) {
      this.props.initMap();
    }
  }

  render() {
    const { breakoutColumn,
            config,
            error,
            errorMessage,
            fetching,
            filters,
            latestYear,
            mapData,
            onFilterChange,
            onStateClick,
            selected,
            setMapElement } = this.props;

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

    const title = `${config.title} (${latestYear} Data)`;

    const chartTitle = (!config.title) ? null :
      <h3 className={styles.chartTitle}>{title}</h3>;

    const chartFootnote = (!config.footnote) ? null :
      <div className={styles.chartFootnote}>
        <p>{config.footnote}</p>
      </div>;

    return (
      <div>
        {chartTitle}
        {filterElement}
        <DataTable
          breakoutColumn={breakoutColumn}
          data={[]}
          dataSeries="map"
          chartType="map"
          year={latestYear}
        />
        <Choropleth
          data={mapData}
          year={latestYear}
          onClick={onStateClick}
          setMapElement={setMapElement}
        />
        {chartFootnote}
      </div>
    );
  }
}
