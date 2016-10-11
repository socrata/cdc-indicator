import React, { Component, PropTypes } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import GeoJsonUpdatable from './GeoJsonUpdatable';
import MapControlUpdatable from './MapControlUpdatable';
import L from 'leaflet';
import d3 from 'd3';
import _ from 'lodash';

import { CONFIG } from '../constants';

import styles from '../styles/choropleth.css';

export default class ChoroplethMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      properties: undefined
    };

    this.getColor = (d) => {
      if (isNaN(d)) {
        return 'transparent';
      }
      // find maximum data value
      const maxDataValue = _.chain(this.props.data.features)
        .map((row) => row.properties.value)
        .max()
        .value();

      const scale = d3.scale.linear()
        .domain([0, maxDataValue])
        .range(['#FFEDA0', '#E31A1C']);

      return scale(d);
    };

    this.style = (feature) => {
      return {
        fillColor: this.getColor(feature.properties.value),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    };

    this.updateInfo = (properties) => {
      this.setState({
        properties
      });
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
      this.props.onClick(
        e.target.feature.properties.abbreviation,
        e.target.feature.properties.name
      );
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
    const { data,
            year } = this.props;

    // if data is empty, return loading icon div
    if (!data.type) {
      return (
        <div className={styles.spinner}>
          <i className="fa fa-circle-o-notch fa-spin"></i>
        </div>
      );
    }

    // find maximum data value
    const maxDataValue = _.chain(data.features)
      .map((row) => row.properties.value)
      .max()
      .value();

    // generate legend
    const legendElements = 4;
    const range = maxDataValue - 0;
    const step = range / (legendElements - 1);
    const legends = Array(legendElements).fill(0).map((value, index) => {
      const currentValue = 0 + step * (legendElements - 1 - index);
      const color = this.getColor(currentValue);
      return (
        <li key={index}>
          <i style={{ background: color }} />
          {_.round(currentValue, 1)}
        </li>
      );
    });

    // hover text
    const properties = this.state.properties;
    const hc = _.chain(properties)
      .get('highConfidence')
      .round(1)
      .value();
    const lc = _.chain(properties)
      .get('lowConfidence')
      .round(1)
      .value();
    const unit = _.get(properties, 'unit', '');
    const info = (properties) ? (
      <div>
        <div>
          <strong>{properties.name}</strong>
        </div>
        <div>
          {year} Data: {properties.value || 'N/A'}{unit || ''}
        </div>
        <div>
          Confidence Limits:
          {isNaN(lc) ? 'N/A' : `${lc}${unit || ''}`} -
          {isNaN(hc) ? 'N/A' : `${hc}${unit || ''}`}
        </div>
      </div>
    ) : <div>Hover over a state</div>;

    return (
      <Map
        center={[37.8, -96]}
        zoom={3}
        style={{ height: '320px' }}
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
          style={this.style}
          onEachFeature={this.onEachFeature}
        />
        <MapControlUpdatable position="topright" styles={styles.info}>
          {info}
        </MapControlUpdatable>
        <MapControlUpdatable>
          <ul className={styles.legend}>
            {legends}
          </ul>
        </MapControlUpdatable>
      </Map>
    );
  }
}

ChoroplethMap.propTypes = {
  data: PropTypes.object.isRequired,
  year: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};
