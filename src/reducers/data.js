import { FETCH_DATA } from '../constants';

const initialState = [];

const actionsMap = {
  [FETCH_DATA]: (state, action) => action.data
};

export default function indicator(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
