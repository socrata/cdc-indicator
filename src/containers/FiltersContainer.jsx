/**
 * Wrapper for <Filter>
 */

import { connect } from 'react-redux';
import _get from 'lodash/get';
import {
  fetchFilters,
  setFilter,
  setIndicatorFilter,
  setLocationFilter
} from 'modules/filters';
import { zoomToState } from 'modules/map';
import Filters from 'components/Filters';
import { CONFIG } from 'constants/index';

const mapStateToProps = (state) => ({
  error: _get(state, 'filters.error'),
  errorMessage: _get(state, 'filters.errorMessage'),
  fetching: _get(state, 'filters.fetching'),
  // filters: state.filters.data,
  filters: _get(state, 'appConfig.config.filter').map((row) => _get(state, `filters.data[${row.value_column}]`)),
  selected: _get(state, 'filters.selected')
});

const mapDispatchToProps = (dispatch) => ({
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
  zoomToStateFn: (state) => {
    dispatch(zoomToState(state));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
