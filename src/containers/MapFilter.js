import { connect } from 'react-redux';
import { setMapFilter } from '../actions';
import Filters from '../components/Filters';

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (event) => {
      dispatch(setMapFilter(event.target.name, event.target.value));
    }
  };
};

const DataFilter = connect(
  undefined,
  mapDispatchToProps
)(Filters);

export default DataFilter;
