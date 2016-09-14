import { connect } from 'react-redux';
import { delayedSetIndicator } from '../actions';
import Hello from '../components/Hello';

const mapStateToProps = (state) => {
  return {
    indicator: state.indicator
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (indicator) => {
      dispatch(delayedSetIndicator(indicator));
    }
  };
};

const Test = connect(
  mapStateToProps,
  mapDispatchToProps
)(Hello);

export default Test;
