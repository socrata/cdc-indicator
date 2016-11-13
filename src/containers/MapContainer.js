import { connect } from 'react-redux';
import _ from 'lodash';
import { initMapContainer, setMapFilterAndFetchData, setStateFilter } from 'modules/map';
import Map from 'components/Map';

const mapStateToProps = (state) => {
  const breakoutColumn = _.get(state, 'appConfig.config.core.breakout_category_id_column');
  const locationColumn = _.get(state, 'appConfig.config.core.location_id_column');

  return {
    breakoutColumn,
    error: state.map.error,
    errorMessage: state.map.errorMessage,
    fetching: state.map.fetching,
    filters: state.map.filterData,
    mapData: state.map.data,
    selected: state.map.filterSelected,
    selectedParentFilters: _.omit(state.filters.selected, locationColumn)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initMap: () => {
      dispatch(initMapContainer());
    },
    onFilterChange: (event) => {
      const index = event.nativeEvent.target.selectedIndex;
      dispatch(
        setMapFilterAndFetchData({
          [event.target.name]: {
            id: event.target.value,
            label: event.nativeEvent.target[index].text
          }
        })
      );
    },
    onStateClick: (abbreviation, state) => {
      dispatch(setStateFilter(abbreviation, state));
    }
  };
};

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);

export default MapContainer;
