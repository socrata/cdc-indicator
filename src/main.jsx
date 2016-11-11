// enable react-redux with redux-thunk middleware
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import AppConfigurationContainer from 'containers/AppConfigurationContainer'; // renders App
import * as reducers from 'reducers';

// import styles that bypasses CSS Modules
import './index.css';

const reducer = combineReducers(reducers);
let middleware = applyMiddleware(thunk);

// Use DevTools chrome extension in development
if (__DEV__) {
  /* eslint-disable no-underscore-dangle */
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
  /* eslint-enable no-underscore-dangle */

  if (typeof devToolsExtension === 'function') {
    middleware = compose(middleware, devToolsExtension());
  }
}

const store = createStore(reducer, middleware);

const MOUNT_ELEMENT = document.getElementById('main');

let renderFn = () => {
  render(
    <Provider store={store}>
      <AppConfigurationContainer />
    </Provider>,
    MOUNT_ELEMENT
  );
};

if (__DEV__ && module.hot) {
  // use RedBox to display runtime error
  const renderApp = renderFn;
  const renderError = (error) => {
    const RedBox = require('redbox-react').default; // eslint-disable-line global-require

    render(<RedBox error={error} />, MOUNT_ELEMENT);
  };
  renderFn = () => {
    try {
      renderApp();
    } catch (error) {
      renderError(error);
    }
  };
}

renderFn();
