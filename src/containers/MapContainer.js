import { connect } from 'react-redux';
import _ from 'lodash';
import { initMapContainer,
         setMapFilterAndFetchData,
         setMapElement,
         setStateFilter,
         zoomToState } from 'modules/map';
import Map from 'components/Map';
import { CONFIG } from 'constants';

const mapStateToProps = (state) => {
  const selectedState = _.get(state, `filters.selected.${CONFIG.locationId}.id`);

  return {
    error: state.map.error,
    errorMessage: state.map.errorMessage,
    fetching: state.map.fetching,
    filters: state.map.filterData,
    isDataReady: !state.indicatorData.fetching && !state.indicatorData.error,
    mapData: state.map.data,
    selected: state.map.filterSelected,
    selectedParentFilters: _.omit(state.filters.selected, CONFIG.locationId),
    selectedState
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
    },
    setMapElement: (element) => {
      dispatch(setMapElement(element));
    },
    zoomToState: (state) => {
      dispatch(zoomToState(state));
    }
  };
};

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);

export default MapContainer;
