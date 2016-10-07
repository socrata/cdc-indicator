import React, { Component, PropTypes } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import GeoJsonUpdatable from './GeoJsonUpdatable';
import * as MapControl from './MapControl';
import L from 'leaflet';
import d3 from 'd3';
import _ from 'lodash';

import { CONFIG } from '../constants';

import styles from '../styles/choropleth.css';

function getColor(d) {
  if (isNaN(d)) {
    return 'transparent';
  }

  const scale = d3.scale.linear()
    .domain([0, 3])
    .range(['#FFEDA0', '#E31A1C']);

  return scale(d);
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.value),
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

export default class ChoroplethMap extends Component {
  constructor(props) {
    super(props);

    this.updateInfo = (prop) => {
      /* eslint-disable no-underscore-dangle */
      if (!prop) {
        this.infoContent._container.innerHTML = 'Hover over a state';
      } else {
        this.infoContent._container.innerHTML = `${prop.name}: ${prop.value || 'N/A'}`;
      }
      /* eslint-enable no-underscore-dangle */
    };

    this.highlightFeature = (e) => {
      const layer = e.target;

      layer.setStyle({
        weight: 2,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }

      this.updateInfo(layer.feature.properties);
    };

    this.resetHighlight = (e) => {
      this.leafletElement.resetStyle(e.target);
      this.updateInfo();
    };

    this.selectState = (e) => {
      this.props.onClick(e.target.feature.properties.abbreviation);
    };

    this.onEachFeature = (feature, layer) => {
      layer.on({
        mouseover: this.highlightFeature,
        mouseout: this.resetHighlight,
        click: this.selectState
      });
    };
  }

  render() {
    const { data } = this.props;

    // if data is empty, return loading icon div
    if (!data.type) {
      return (
        <div className={styles.spinner}>
          <i className="fa fa-circle-o-notch fa-spin"></i>
        </div>
      );
    }

    // generate legend
    const legendElements = 4;
    const range = 3 - 0;
    const step = range / (legendElements - 1);
    const legends = Array(legendElements).fill(0).map((value, index) => {
      const currentValue = 0 + step * (legendElements - 1 - index);
      const color = getColor(currentValue);
      return (
        <li key={index}>
          <i style={{ background: color }} />
          {_.round(currentValue, 1)}
        </li>
      );
    });

    return (
      <Map
        center={[37.8, -96]}
        zoom={3}
        style={{ height: '300px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={`${CONFIG.map.tileUrl}?access_token=${CONFIG.map.mapboxToken}`}
          id={CONFIG.map.tileId}
          attribution={CONFIG.map.attribution}
        />
        <GeoJsonUpdatable
          ref={(ref) => {
            if (ref) {
              this.leafletElement = ref.leafletElement;
            }
          }}
          data={data}
          style={style}
          onEachFeature={this.onEachFeature}
        />
        <MapControl.Info
          ref={(ref) => {
            if (ref) {
              this.infoContent = ref.leafletElement;
            }
          }}
        >
          Hover over a state
        </MapControl.Info>
        <MapControl.Legend>
          <ul className={styles.legend}>
            {legends}
          </ul>
        </MapControl.Legend>
      </Map>
    );
  }
}

ChoroplethMap.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
