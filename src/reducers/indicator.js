import { UPDATE_INDICATOR } from '../constants';

const initialState = 'World';

const actionsMap = {
  [UPDATE_INDICATOR]: (state, action) => action.indicator
};

export default function indicator(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
