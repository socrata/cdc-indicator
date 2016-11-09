import { connect } from 'react-redux';
import { fetchConfig } from 'modules/appConfig';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
    coreConfig: state.appConfig.config.core,
    dataSourceConfig: state.appConfig.config.dataSource,
    error: state.appConfig.error,
    errorMessage: state.appConfig.errorMessage,
    fetching: state.appConfig.fetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadConfig: () => {
      dispatch(fetchConfig());
    }
  };
};

const AppConfigurationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppConfigurationContainer;
