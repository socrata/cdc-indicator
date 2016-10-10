import { connect } from 'react-redux';
import { fetchAppConfigurations } from '../actions';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
    config: state.config
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadConfig: () => {
      dispatch(fetchAppConfigurations());
    }
  };
};

const AppConfiguration = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppConfiguration;
