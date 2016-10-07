import { connect } from 'react-redux';
import { setFilter } from '../actions';
import Filters from '../components/Filters';

const mapStateToProps = (state) => {
  return {
    currentFilter: state.filter
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (event) => {
      dispatch(setFilter(event.target.name, event.target.value));
    },
    onLoad: (key, value) => {
      dispatch(setFilter(key, value));
    }
  };
};

const DataFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);

export default DataFilter;
