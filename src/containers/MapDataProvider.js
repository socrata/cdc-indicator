import { connect } from 'react-redux';
import { fetchMapData } from '../actions';
import Map from '../components/Map';

const mapStateToProps = (state) => {
  return {
    data: state.mapData,
    filter: state.filter,
    mapFilter: state.mapFilter
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: (primaryFilter, secondaryFilter) => {
      dispatch(fetchMapData(primaryFilter, secondaryFilter));
    }
  };
};

const MapDataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);

export default MapDataProvider;
