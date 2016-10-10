import { FETCH_CONFIG } from '../constants';

const initialState = {};

const actionsMap = {
  [FETCH_CONFIG]: (state, action) => action.config
};

export default function config(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
