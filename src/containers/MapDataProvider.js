import { connect } from 'react-redux';
import { fetchMapData,
         setFilter,
         setMapElement } from '../actions';
import Map from '../components/Map';
import _ from 'lodash';

const mapStateToProps = (state) => {
  // we do not need to filter by state - but pass all other filters
  const validFilters = _.without(Object.keys(state.filter), 'locationabbr');

  return {
    data: state.mapData,
    rawData: state.data,
    filter: _.pick(state.filter, validFilters),
    label: state.label,
    year: state.config.latestYear
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (abbreviation, state) => {
      dispatch(setFilter('locationabbr', abbreviation, state));
    },
    loadData: (filter, year) => {
      dispatch(fetchMapData(filter, year));
    },
    setMapElement: (mapElement) => {
      dispatch(setMapElement(mapElement));
    }
  };
};

const MapDataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);

export default MapDataProvider;
