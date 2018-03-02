import PropTypes from 'prop-types';
import { GeoJSON } from 'react-leaflet';

class GeoJsonUpdatable extends GeoJSON {
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.leafletElement.clearLayers();
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.leafletElement.addData(this.props.data);
    }
  }
}

GeoJsonUpdatable.propTypes = {
  data: PropTypes.shape({
    features: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string
  }).isRequired
};

export default GeoJsonUpdatable;
