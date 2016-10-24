import { FETCH_MAP_DATA } from '../constants';

const initialState = {};

const actionsMap = {
  [FETCH_MAP_DATA]: (state, action) => action.mapData
};

export default function mapData(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
