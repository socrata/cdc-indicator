// enable react-redux with redux-thunk middleware
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import {
  createStore, combineReducers, compose, applyMiddleware
} from 'redux';
import thunk from 'redux-thunk';
import a11y from 'react-a11y';
import * as reducers from 'reducers';
import App from 'containers/App'; // renders App

// import styles that bypasses CSS Modules
import './index.css';

// enable a11y helper during DEV
if (__DEV__) {
  a11y(React, ReactDOM);
}

const reducer = combineReducers(reducers);
let middleware = applyMiddleware(thunk);

// Use DevTools chrome extension in development
if (__DEV__ && __REDUX_DEV__) {
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
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>,
    MOUNT_ELEMENT
  );
};

if (__DEV__ && module.hot) {
  // use RedBox to display runtime error
  const renderApp = renderFn;
  const renderError = (error) => {
    const RedBox = require('redbox-react').default; // eslint-disable-line global-require

    ReactDOM.render(<RedBox error={error} />, MOUNT_ELEMENT);
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
