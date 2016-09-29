import { UPDATE_MAP_FILTER } from '../constants';

// get list of filter names from configuration
import filters from '../config/filters.yml';
import breakouts from '../config/breakouts.yml';

const defaultBreakout = filters.filter((row) => row.name === 'breakoutcategoryid').shift();

const initialState = {
  year: breakouts.year.defaultValue,
  breakoutid: breakouts[(defaultBreakout.defaultValue || 'GPOVER')].defaultValue
};

const actionsMap = {
  [UPDATE_MAP_FILTER]: (state, action) =>
    Object.assign({}, state, { [action.key]: action.value })
};

export default function filter(state = initialState, action) {
  const fn = actionsMap[action.type];
  if (!fn) {
    return state;
  }
  return fn(state, action);
}
