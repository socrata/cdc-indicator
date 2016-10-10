// enable react-redux with redux-thunk middleware
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import AppConfigurationProvider from './containers/AppConfigurationProvider'; // renders App
import * as reducers from './reducers';

const reducer = combineReducers(reducers);
const finalCreateStore = applyMiddleware(thunk)(createStore);
const store = finalCreateStore(reducer);

render(
  <Provider store={store}>
    <AppConfigurationProvider />
  </Provider>,
  document.getElementById('main')
);
