import { connect } from 'react-redux';
import { fetchFilters,
         setFilter,
         setIndicatorFilter,
         setLocationFilter } from 'modules/filters';
import { zoomToState } from 'modules/map';
import Filters from 'components/Filters';
import { CONFIG } from 'constants';

const mapStateToProps = (state) => {
  return {
    error: state.filters.error,
    errorMessage: state.filters.errorMessage,
    fetching: state.filters.fetching,
    // filters: state.filters.data,
    filters: state.appConfig.config.filter.map((row) => {
      return state.filters.data[row.value_column];
    }),
    selected: state.filters.selected
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadFilters: () => {
      dispatch(fetchFilters());
    },
    onFilterChange: (event) => {
      const index = event.nativeEvent.target.selectedIndex;

      switch (event.target.name) {
        case CONFIG.indicatorId:
          dispatch(setIndicatorFilter({
            id: event.target.value,
            label: event.nativeEvent.target[index].text
          }));
          break;
        case CONFIG.locationId:
          dispatch(setLocationFilter({
            id: event.target.value,
            label: event.nativeEvent.target[index].text
          }));
          break;
        default:
          dispatch(setFilter({
            [event.target.name]: {
              id: event.target.value,
              label: event.nativeEvent.target[index].text
            }
          }));
      }
    },
    zoomToState: (state) => {
      dispatch(zoomToState(state));
    }
  };
};

const MainFilterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);

export default MainFilterContainer;
