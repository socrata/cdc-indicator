// vendors
import { PropTypes } from 'react';
import C3Chart from 'react-c3js';
import d3 from 'd3';
import _ from 'lodash';

// custom tooltip content
// this is defined here using function.. syntax because we want "this" to point to c3js
function customTooltip(data, defaultTitleFormat, defaultValueFormat, color) {
  // override title format
  const customTitleFormat = (x) => {
    return `${defaultTitleFormat(x)} Data (Confidence Limits)`;
  };

  return this.getTooltipContent(data, customTitleFormat, defaultValueFormat, color);
}

export default class C3ChartUpdatable extends C3Chart {
  constructor(props) {
    super(props);

    // helper to grab updated custom params
    this.getUnit = () => this.props.custom.unit || '';
    this.getHC = (id, index) => {
      return _.get(this.props, `custom.limits[${id}][${index}].high`, 'N/A');
    };
    this.getLC = (id, index) => {
      return _.get(this.props, `custom.limits[${id}][${index}].low`, 'N/A');
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data.columns, this.props.data.columns)) {
      const oldKeys = this.props.data.columns.map((row) => row[0]);
      const newKeys = nextProps.data.columns.map((row) => row[0]);
      _.pullAll(oldKeys, newKeys); // old keys to unload

      const newConfig = {
        unload: oldKeys
      };

      if (nextProps.axis && nextProps.axis.y) {
        this.chart.axis.labels({
          y: nextProps.axis.y.label.text
        });
      }

      if (nextProps.axis && nextProps.axis.x && nextProps.axis.x.categories) {
        newConfig.categories = nextProps.axis.x.categories;
      }

      this.chart.load(Object.assign({}, nextProps.data, newConfig));
    }
  }

  componentDidMount() {
    let props = this.props;

    // override tooltip format
    if (_.get(this.props, 'data.type') !== 'pie') {
      props = Object.assign({}, this.props, {
        tooltip: {
          format: {
            value: (value, ratio, id, index) => {
              const lc = `${this.getLC(id, index)}${this.getUnit()}`;
              const hc = `${this.getHC(id, index)}${this.getUnit()}`;
              return `${value}${this.getUnit()} (${lc}–${hc})`;
            }
          },
          contents: customTooltip
        }
      });
    } else {
      props = Object.assign({}, this.props, {
        tooltip: {
          format: {
            value: (value, ratio) => {
              return `
                ${props.year || ''} Data: ${value}${this.getUnit()}
                (${d3.format('.1%')(ratio)} of total)
              `;
            }
          }
        }
      });
    }

    this.updateChart(props);
  }
}

C3ChartUpdatable.propTypes = {
  data: PropTypes.object.isRequired
};
