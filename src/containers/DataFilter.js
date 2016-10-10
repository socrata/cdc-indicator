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
      const index = event.nativeEvent.target.selectedIndex;
      dispatch(
        setFilter(event.target.name, event.target.value, event.nativeEvent.target[index].text)
      );
    },
    onLoad: (key, value, label) => {
      dispatch(setFilter(key, value, label));
    }
  };
};

const DataFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);

export default DataFilter;
