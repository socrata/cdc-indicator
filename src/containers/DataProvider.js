import { connect } from 'react-redux';
import { fetchData } from '../actions';
import IndicatorExplorer from '../components/IndicatorExplorer';
import { CONFIG } from '../constants';
import _ from 'lodash';

const mapStateToProps = (state) => {
  // only return filters that are defined in configurations
  const validFilters = CONFIG.filters.map((filter) => filter.name);

  return {
    data: state.data,
    filter: _.pick(state.filter, validFilters)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: (filter) => {
      dispatch(fetchData(filter));
    }
  };
};

const DataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndicatorExplorer);

export default DataProvider;
