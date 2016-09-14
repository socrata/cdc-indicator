import { connect } from 'react-redux';
import { fetchData } from '../actions';
import IndicatorExplorer from '../components/IndicatorExplorer';

const mapStateToProps = (state) => {
  return {
    data: state.data
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: () => {
      dispatch(fetchData());
    }
  };
};

const DataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndicatorExplorer);

export default DataProvider;
