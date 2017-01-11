import React from 'react';
import { GeoJSON } from 'react-leaflet';

export default class GeoJsonUpdatable extends GeoJSON {
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
  data: React.PropTypes.object.isRequired
};
