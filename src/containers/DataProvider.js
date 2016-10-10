import { connect } from 'react-redux';
import { fetchData } from '../actions';
import IndicatorExplorer from '../components/IndicatorExplorer';
import _ from 'lodash';

const mapStateToProps = (state) => {
  // only return filters that are defined in configurations
  const validFilters = state.config.filterConfig.map((filter) => filter.name);

  return {
    config: state.config,
    data: state.data,
    filter: _.pick(state.filter, validFilters),
    label: state.label
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: (filter, fromYear) => {
      dispatch(fetchData(filter, fromYear));
    }
  };
};

const DataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndicatorExplorer);

export default DataProvider;
