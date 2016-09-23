import { connect } from 'react-redux';
import { fetchData } from '../actions';
import IndicatorExplorer from '../components/IndicatorExplorer';

const mapStateToProps = (state) => {
  return {
    data: state.data,
    filter: state.filter
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
