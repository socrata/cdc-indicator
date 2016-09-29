import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { MapControl } from 'react-leaflet';

export default class Legend extends MapControl {
  componentWillMount() {
    const { position } = this.props;
    const legend = L.control({ position });
    const jsx = (
      <div>
        {this.props.children}
      </div>
    );

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', '');
      ReactDOM.render(jsx, div);
      return div;
    };

    this.leafletElement = legend;
  }
}

Legend.propTypes = {
  position: PropTypes.string.isRequired
};

Legend.defaultProps = {
  position: 'bottomright'
};
