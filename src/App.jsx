// enable react-redux with redux-thunk middleware
import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import DataProvider from './containers/DataProvider'; // renders IndicatorExplorer
import * as reducers from './reducers';

const reducer = combineReducers(reducers);
const finalCreateStore = applyMiddleware(thunk)(createStore);
const store = finalCreateStore(reducer);

const App = () => (
  <Provider store={store}>
    <DataProvider />
  </Provider>
);

export default App;
