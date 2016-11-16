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
    this.getUnit = () => {
      return ((this.props.custom.unit || '') === '%') ? '%' : '';
    };
    this.getHC = (id, index) => {
      return _.get(this.props, `custom.limits[${id}][${index}].high`, 'N/A');
    };
    this.getLC = (id, index) => {
      return _.get(this.props, `custom.limits[${id}][${index}].low`, 'N/A');
    };

    this.formatTooltips = (originalProps) => {
      let newProps;

      // override tooltip format
      if (_.get(originalProps, 'data.type') !== 'pie') {
        newProps = Object.assign({}, originalProps, {
          tooltip: {
            format: {
              value: (value, ratio, id, index) => {
                const lc = `${this.getLC(id, index)}${this.getUnit()}`;
                const hc = `${this.getHC(id, index)}${this.getUnit()}`;
                const cl = (lc === 'N/A' && hc === 'N/A') ? 'N/A' : `${lc}–${hc}`;
                return `${value}${this.getUnit()} (${cl})`;
              }
            },
            contents: customTooltip
          }
        });
      } else {
        newProps = Object.assign({}, originalProps, {
          tooltip: {
            format: {
              value: (value, ratio) => {
                return `
                  ${value}${this.getUnit()}
                  (${d3.format('.1%')(ratio)} of total)
                `;
              }
            }
          }
        });
      }

      return newProps;
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data.columns, this.props.data.columns)) {
      const props = this.formatTooltips(nextProps);
      this.updateChart(props);
    }
  }

  componentDidMount() {
    const props = this.formatTooltips(this.props);
    this.updateChart(props);
  }
}

C3ChartUpdatable.propTypes = {
  data: PropTypes.object.isRequired
};
