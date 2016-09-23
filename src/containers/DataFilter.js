import { connect } from 'react-redux';
import { setFilter } from '../actions';
import Filters from '../components/Filters';

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (event) => {
      dispatch(setFilter(event.target.name, event.target.value));
    }
  };
};

const DataFilter = connect(
  undefined,
  mapDispatchToProps
)(Filters);

export default DataFilter;
