import { UPDATE_FILTER } from '../constants';

// get list of filter names from configuration
import filters from '../config/filters.yml';

const initialState = filters.reduce((accumulator, row) => {
  const acc = accumulator;
  acc[row.name] = row.defaultValue;
  return acc;
}, {});

const actionsMap = {
  [UPDATE_FILTER]: (state, action) =>
    Object.assign({}, state, { [action.key]: action.value })
};

export default function filter(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
