/**
 * An updatable version of MapControl React component from react-leaflet
 */

// vendors
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { MapControl } from 'react-leaflet';

export default class MapControlUpdatable extends MapControl {
  constructor(props) {
    super(props);

    // create a div to mount to and save to state
    this.state = {
      div: L.DomUtil.create('div', props.styles || '')
    };
  }

  componentWillMount() {
    const { position,
            children } = this.props;
    const legend = L.control({ position });
    const jsx = <div>{children}</div>;

    legend.onAdd = () => {
      const div = this.state.div;
      ReactDOM.render(jsx, div);
      return div;
    };

    // expose leafletElement
    this.leafletElement = legend;
  }

  // re-mount new children when receiving new props
  componentWillReceiveProps(nextProps) {
    const jsx = <div>{nextProps.children}</div>;
    ReactDOM.render(jsx, this.state.div);
  }
}

MapControlUpdatable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  position: PropTypes.string.isRequired,
  styles: PropTypes.string
};

MapControlUpdatable.defaultProps = {
  position: 'bottomright'
};
