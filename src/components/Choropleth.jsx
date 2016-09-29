import React, { Component, PropTypes } from 'react';
import { Map, TileLayer, GeoJson } from 'react-leaflet';
import * as MapControl from './MapControl';
import L from 'leaflet';
import d3 from 'd3';

import './Choropleth.css';

const token =
  'pk.eyJ1IjoiaGlrb25haXRvIiwiYSI6ImNpdGtoNjNlbzBibGYyb21rb3VhYWJsbzcifQ.hM8fZcBoGykyLgezk_c85A';

function getColor(d) {
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
        this.infoContent._container.innerHTML = `${prop.name}: ${prop.value}`;
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

    this.onEachFeature = (feature, layer) => {
      layer.on({
        mouseover: this.highlightFeature,
        mouseout: this.resetHighlight
        // click: zoomToFeature
      });
    };
  }

  render() {
    const { data } = this.props;

    // if data is empty, return empty component
    if (!data.type) {
      return null;
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
          url={`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${token}`}
          id="mapbox.light"
          attribution={'Map data © ' +
            '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>'}
        />
        <GeoJson
          ref={(ref) => {
            this.leafletElement = ref.leafletElement;
          }}
          data={data}
          style={style}
          onEachFeature={this.onEachFeature}
        />
        <MapControl.Info
          ref={(ref) => {
            this.infoContent = ref.leafletElement;
          }}
        >
          Hover over a state
        </MapControl.Info>
        <MapControl.Legend>
          <ul className="choropleth-legend">
            {legends}
          </ul>
        </MapControl.Legend>
      </Map>
    );
  }
}

ChoroplethMap.propTypes = {
  data: PropTypes.object.isRequired
};
