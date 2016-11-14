import { connect } from 'react-redux';
import _ from 'lodash';
import { fetchFilters, setFilter } from 'modules/filters';
import { zoomToState } from 'modules/map';
import Filters from 'components/Filters';

const mapStateToProps = (state) => {
  const locationColumn = _.get(state, 'appConfig.config.core.location_id_column', '');

  return {
    error: state.filters.error,
    errorMessage: state.filters.errorMessage,
    fetching: state.filters.fetching,
    filters: state.filters.data,
    locationColumn,
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
      dispatch(
        setFilter({
          [event.target.name]: {
            id: event.target.value,
            label: event.nativeEvent.target[index].text
          }
        })
      );
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
