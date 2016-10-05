import { connect } from 'react-redux';
import { fetchMapData } from '../actions';
import Map from '../components/Map';
import _ from 'lodash';

const mapStateToProps = (state) => {
  // we do not need to filter by state - but pass all other filters
  const validFilters = _.without(Object.keys(state.filter), 'locationabbr');

  return {
    data: state.mapData,
    filter: _.pick(state.filter, validFilters)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: (filter) => {
      dispatch(fetchMapData(filter));
    }
  };
};

const MapDataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);

export default MapDataProvider;
