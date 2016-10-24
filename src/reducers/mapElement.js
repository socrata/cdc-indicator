import { SET_MAP_ELEMENT } from '../constants';

const initialState = {};

const actionsMap = {
  [SET_MAP_ELEMENT]: (state, action) => action.mapElement || state
};

export default function config(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
