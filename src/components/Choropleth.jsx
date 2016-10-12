/**
 * Updatable Leaflet/Mapbox Choropleth Map component
 */

// vendors
import React, { Component, PropTypes } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import d3 from 'd3';
import _ from 'lodash';
// custom
import GeoJsonUpdatable from './GeoJsonUpdatable';
import MapControlUpdatable from './MapControlUpdatable';
import getCentroid from '../lib/geojsonCentroid';
import { CONFIG } from '../constants';
// styles
import styles from '../styles/choropleth.css';

export default class ChoroplethMap extends Component {
  constructor(props) {
    super(props);

    // store properties of hovered layer in state to update info component
    this.state = {
      properties: undefined
    };

    // calculate maximum/minimum value of data based on current props
    this.getMaxValue = () => {
      return _.chain(this.props.data.features)
        .map((row) => row.properties.value)
        .max()
        .value();
    };
    this.getMinValue = () => {
      return _.chain(this.props.data.features)
        .map((row) => row.properties.value)
        .min()
        .value();
    };

    // get outer bounds of data value
    this.getDataRange = () => {
      // round down/up to nearest integer
      const min = _.floor(this.getMinValue());
      const max = _.ceil(this.getMaxValue());
      return [(isNaN(min) ? 0 : min), (isNaN(max) ? Infinity : max)];
    };

    this.getColor = (d) => {
      if (isNaN(d)) {
        return 'transparent';
      }
      const scale = d3.scale.linear()
        .domain(this.getDataRange())
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
      const centroid = getCentroid(e.target.feature.geometry).coordinates;
      this.mapElement.setView(
        L.latLng({
          lat: centroid[1],
          lng: centroid[0]
        }),
        4,
        { animate: true }
      );
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

    // populate legend items
    this.getLegend = (numberOfItems) => {
      const [min, max] = this.getDataRange();
      const step = (max - min) / (numberOfItems - 1);

      // invalid data (max is Infinity and min is 0, resulting in Infinity)
      if (step === Infinity) {
        return null;
      }

      const legends = Array(numberOfItems).fill(0).map((value, index) => {
        const currentValue = min + (step * (numberOfItems - 1 - index));
        const color = this.getColor(currentValue);
        return (
          <li key={index}>
            <i style={{ background: color }} />
            {_.round(currentValue)}
          </li>
        );
      });

      return (
        <ul className={styles.legend}>
          {legends}
        </ul>
      );
    };

    // get info tooltip element
    this.getInfoElement = (properties) => {
      if (!properties) {
        return <div>Hover over a state</div>;
      }

      const hc = _.chain(properties)
        .get('highConfidence')
        .round(1)
        .value();

      const lc = _.chain(properties)
        .get('lowConfidence')
        .round(1)
        .value();

      const unit = _.get(properties, 'unit', '');
      const value = (properties.value) ? `${properties.value}${unit}` : 'N/A';

      // if both low and high limits are N/A, display a single 'N/A'
      const cl = (isNaN(lc) && isNaN(hc)) ? 'N/A' :
        `${isNaN(lc) ? 'N/A' : `${lc}${unit}`}–${isNaN(hc) ? 'N/A' : `${hc}${unit}`}`;

      return (
        <div>
          <div>
            <strong>{properties.name}</strong>
          </div>
          <div>
            {`${this.props.year} Data: ${value}`}
          </div>
          <div>
            {`Confidence Limits: ${cl}`}
          </div>
        </div>
      );
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
    const legend = this.getLegend(4);
    // hover text
    const info = this.getInfoElement(this.state.properties);

    return (
      <Map
        center={[37.8, -96]}
        zoom={3}
        style={{ height: '320px' }}
        scrollWheelZoom={false}
        ref={(ref) => {
          if (ref) {
            this.mapElement = ref.leafletElement;
          }
        }}
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
        <MapControlUpdatable
          position="topright"
          styles={styles.info}
        >
          {info}
        </MapControlUpdatable>
        <MapControlUpdatable>
          {legend}
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
