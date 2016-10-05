import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { MapControl } from 'react-leaflet';

import styles from '../styles/choropleth.css';

export default class Info extends MapControl {
  componentWillMount() {
    const { position } = this.props;
    const info = L.control({ position });
    const jsx = (
      <div>
        {this.props.children}
      </div>
    );

    info.onAdd = () => {
      const div = L.DomUtil.create('div', styles.info);
      ReactDOM.render(jsx, div);
      return div;
    };

    this.leafletElement = info;
  }
}

Info.propTypes = {
  position: PropTypes.string.isRequired
};

Info.defaultProps = {
  position: 'topright'
};
