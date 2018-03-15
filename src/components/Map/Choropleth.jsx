/**
 * Updatable Leaflet/Mapbox Choropleth Map component
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import d3 from 'd3';
import _ceil from 'lodash/ceil';
import _floor from 'lodash/floor';
import _get from 'lodash/get';
import _isInteger from 'lodash/isInteger';
import _round from 'lodash/round';
import _toString from 'lodash/toString';
import _flow from 'lodash/fp/flow';
import _filter from 'lodash/fp/filter';
import _map from 'lodash/fp/map';
import _maxBy from 'lodash/fp/maxBy';
import _minBy from 'lodash/fp/minBy';
import { getLatLongBounds, t } from 'lib/utils';
import { CONFIG } from 'constants/index';
import styles from 'styles/choropleth.css';
import GeoJsonUpdatable from './GeoJsonUpdatable';
import MapControlUpdatable from './MapControlUpdatable';

class ChoroplethMap extends Component {
  constructor(props) {
    super(props);

    // store properties of hovered layer in state to update info component
    this.state = {
      properties: undefined
    };

    // calculate maximum/minimum value of data based on current props
    this.getMaxValue = () => _flow(
      _map(row => row.properties.value),
      _maxBy(x => x)
    )(this.props.data.features);
    // this.getMaxValue = () => _.chain(this.props.data.features)
    //   .map(row => row.properties.value)
    //   .max()
    //   .value();

    this.getMinValue = () => _flow(
      _map(row => row.properties.value),
      _minBy(x => x)
    )(this.props.data.features);
    // this.getMinValue = () => _.chain(this.props.data.features)
    //   .map(row => row.properties.value)
    //   .min()
    //   .value();

    // check if empty values exist based on current props
    this.hasEmptyValues = () => _filter((row =>
      row.properties.value === undefined
        || Number.isNaN(row.properties.value)), this.props.data.features)
      .length > 0;
    // this.hasEmptyValues = () => _.chain(this.props.data.features)
    //   .filter(row => Number.isNaN(row.properties.value))
    //   .value().length > 0;

    // get outer bounds of data value
    this.getDataRange = () => {
      // round down/up to nearest integer
      // const min = _.floor(this.getMinValue());
      // const max = _.ceil(this.getMaxValue());
      const min = this.getMinValue();
      const max = this.getMaxValue();

      return [
        (min === undefined || Number.isNaN(min) ? 0 : min),
        (max === undefined || Number.isNaN(max) ? Infinity : max)
      ];
      // return [(isNaN(min) ? 0 : min), rangeOne, rangeTwo, (isNaN(max) ? Infinity : max)];
    };
    // setting the color if n/a
    this.getColor = (d) => {
      if (d === undefined || Number.isNaN(d) || d === 'N/A') {
        return '#999999';
      }
      // set color range
      const scale = d3.scale.quantile()
        .domain(this.getDataRange())
        .range(['rgb(255,237,160)', 'rgb(248,184,127)', 'rgb(241,132,94)', 'rgb(234,79,61)']);
      return scale(d);
    };

    this.style = feature => ({
      fillColor: this.getColor(feature.properties.value),
      weight: 1,
      opacity: 1,
      color: 'white',
      // dashArray: '3',
      fillOpacity: 1
    });

    this.updateInfo = (properties) => {
      this.setState({ properties });
    };

    this.highlightFeature = (e) => {
      const layer = e.target;

      layer.setStyle({
        weight: 2,
        color: '#6ff',
        dashArray: '',
        fillOpacity: 1
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

    this.resetMapView = (e) => {
      e.preventDefault();
      this.mapElement.setView(CONFIG.map.defaults.center, CONFIG.map.defaults.zoom, {
        animate: true
      });

      // this.props.onClick('US', 'United States');
    };

    this.selectState = (e) => {
      const boundArray = getLatLongBounds(e.target.feature.geometry, 0.5);
      if (boundArray) {
        const bounds = L.latLngBounds(boundArray);
        this.mapElement.setView(
          bounds.getCenter(),
          this.mapElement.getBoundsZoom(bounds),
          { animate: true }
        );
      }

      this.props.onClick(
        e.target.feature.properties.abbreviation,
        e.target.feature.properties.name
      );
    };

    this.onEachFeature = (feature, layer) => {
      layer.on({
        mouseover: this.highlightFeature,
        mouseout: this.resetHighlight,
        touchstart: this.highlightFeature,
        touchend: this.resetHighlight,
        click: this.selectState
      });
    };

    // populate legend items
    this.getLegend = (numberOfItems) => {
      const [min, max] = this.getDataRange();

      const step = (max - min) / (numberOfItems);

      // invalid data (max is Infinity and min is 0, resulting in Infinity)
      if (step === Infinity) {
        const color = this.getColor(NaN);
        return (
          <ul className={styles.legend}>
            <li>
              <i style={{ background: color }} />
              N/A
            </li>
          </ul>
        );
      }
      // const test = this.getDataRange();

      const values = Array(numberOfItems).fill(0).map((value, index) =>
        // _.round(min + (step * (numberOfItems - 1 - index)), 1),
        min + (step * (numberOfItems - 1 - index)));

      const endValues = values.map((value, index) => {
        if (index === 0) {
          // return _.round(max, 1);
          return max;
        }
        // return _.round(values[index - 1] - 0.1, 1);
        return values[index - 1] - 0.1;
      });

      // Add N/A to legend if empty values exist
      // if (this.hasEmptyValues()) {
      //   values.push('N/A');
      //   endValues.push('N/A');
      // }
      // always add N/A to ensure "Equal Interval" is at the bottom
      values.push('N/A');
      endValues.push('N/A');

      // if all values are integers, do not display 0-pad values
      // const isAllIntegers = values.reduce((isInteger, value) => {
      //   return isInteger && _.isInteger(value);
      // }, true);

      const legends = values.map((value, index) => {
        const color = this.getColor(value);
        let displayValue = _ceil(Number(_toString(value)), 1).toFixed(1);
        // setting legend ranges and values
        if (value === min) {
          displayValue = _floor(min, 1).toFixed(1);
        }
        let endValue = _toString(endValues[index]);
        if (_isInteger(endValues[index])) {
          endValue += '.0';
        } else if (_isInteger(_round(endValue, 1))) {
          endValue = _ceil(endValue, 1).toFixed(1);
        } else {
          endValue = _ceil(endValue, 2).toFixed(1);
        }

        return (
          <li className="legend" key={t(`${displayValue.toString()}_${endValue.toString()}`)}>
            <i style={{ background: color }} />
            { // return range or single value
              (displayValue !== endValue
                && !Number.isNaN(displayValue)
                && !Number.isNaN(endValue))
                  ? `${displayValue} – ${endValue}`
                  : 'N/A'
            }
          </li>
        );
      });
      return (
        <ul className={styles.legend} id="us-map-legend-ul">
          {legends}
        </ul>
      );
    };
    // get info tooltip element
    this.getInfoElement = (properties) => {
      if (!properties) {
        return <div>Hover over a state</div>;
      }
      const valueType = _get(properties, 'dataValueType');
      const hc = _get(properties, 'highConfidence');
      const lc = _get(properties, 'lowConfidence');

      const unitValue = _get(properties, 'unit', '');
      const unit = (unitValue.length > 1) ? '' : unitValue;
      const value = (properties.value) ? `${properties.value}${unit}` : 'N/A';
      const breakoutLabel = _get(properties, `${CONFIG.breakoutLabel}`, 'N/A');

      const unitInfo = (unitValue.length > 1) ? `(${unitValue})` : '';
      // if both low and high limits are N/A, suppress confidence limits
      let ConfidenceLimits = null;
      if (Number.isNaN(lc) && Number.isNaN(hc)) {
        ConfidenceLimits = '';
      } else {
        const lcFormat = Number.isNaN(lc) ? 'N/A' : `${lc}${unit}`;
        const hcFormat = Number.isNaN(hc) ? 'N/A' : `${hc}${unit}`;
        ConfidenceLimits = `Confidence Limits: ${lcFormat}–${hcFormat}`;
      }

      return (
        <div>
          <div>
            <strong>{`${properties.name} - ${this.props.year}`}</strong>
          </div>
          <div>
            {`${breakoutLabel}`}
          </div>
          <div>
            {`${valueType} ${unitInfo}: ${value}`}
          </div>
          <div>
            {`${ConfidenceLimits}`}
          </div>
        </div>
      );
    };
  }

  componentDidMount() {
    this.props.setMapElement(this.mapElement);

    setTimeout(() => {
      d3.select(this.mapElement.getPanes().overlayPane).select('svg')
        .insert('desc', ':first-child')
        .text(`This map displays ${this.props.desc} values by states.`);
      d3.select(this.mapElement.getPanes().overlayPane).select('svg')
        .insert('title', ':first-child')
        .text(this.props.title);
    }, 0);

    if (this.props.selectedState && this.props.selectedState !== 'US') {
      this.props.zoomToState(this.props.selectedState);
    }
  }

  componentWillUnmount() {
    this.props.setMapElement();
  }

  render() {
    const { data } = this.props;

    // if data is empty, return loading icon div
    if (!data.type) {
      return (
        <div className={styles.spinner}>
          <i className="fa fa-circle-o-notch fa-spin" />
        </div>
      );
    }

    // generate legend
    const legend = this.getLegend(4);
    // hover text
    const info = this.getInfoElement(this.state.properties);

    return (
      <Map
        center={CONFIG.map.defaults.center || [37.8, -96]}
        zoom={CONFIG.map.defaults.zoom || 3}
        style={{ height: `${CONFIG.map.defaults.height || 320}px` }}
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
        <MapControlUpdatable
          position="bottomleft"
          styles={styles.infoBottomLeft}
        >
          <div>
            <button onClick={this.resetMapView}>
              Reset Map
            </button>
          </div>
        </MapControlUpdatable>
      </Map>
    );
  }
}

ChoroplethMap.propTypes = {
  data: PropTypes.shape({
    features: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string
  }).isRequired,
  desc: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  selectedState: PropTypes.string.isRequired,
  setMapElement: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  zoomToState: PropTypes.func.isRequired
};

export default ChoroplethMap;
