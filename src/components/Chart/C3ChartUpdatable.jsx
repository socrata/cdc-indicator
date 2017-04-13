// vendors
import { PropTypes } from 'react';
import C3Chart from 'react-c3js';
import d3 from 'd3';
import _ from 'lodash';

export default class C3ChartUpdatable extends C3Chart {
  formatTooltips = (originalProps) => {
    let newProps;
    // override tooltip format
    if (_.get(originalProps, 'data.type') !== 'pie') {
      debugger; // eslint-disable-line
      newProps = Object.assign({}, originalProps, {
        tooltip: {
          format: {
            value: (value, ratio, id, index) => {
              const result = this.scaleValue(value);
              const lc = this.processValue(this.getLC(id, index));
              const hc = this.processValue(this.getHC(id, index));
              const cl = (lc === 'N/A' && hc === 'N/A') ? '' : `(${lc}–${hc})`;
              return `${this.processValue(result)} ${cl}`;
            }
          },
          contents: (data, defaultTitleFormat, defaultValueFormat, color) => {
            // get c3js object
            const $$ = this.chart.internal;
            const hasConfidenceLimits = _.some(data, (obj) => {
              const lc = this.processValue(this.getLC(obj.id, obj.index));
              const hc = this.processValue(this.getHC(obj.id, obj.index));
              return lc !== 'N/A' || hc !== 'N/A';
            });

            const customString = hasConfidenceLimits
                                  ? 'Data (Confidence Limits)'
                                  : 'Data';

            // override title format
            const customTitleFormat = function customTitleFormat(x) {
              return `${defaultTitleFormat(x)} ${customString}`;
            };

            return $$.getTooltipContent(data, customTitleFormat, defaultValueFormat, color);
          }
        }
      });
    } else {
      newProps = Object.assign({}, originalProps, {
        tooltip: {
          format: {
            value: (value, ratio) => {
              const result = this.scaleValue(value);
              return `
                ${this.processValue(result)}
                (${d3.format('.1%')(ratio)} of total)
              `;
            }
          }
        }
      });
    }

    newProps.onrendered = this.setTitle;

    if (_.get(originalProps, 'data.type') === 'line') {
      newProps.onrendered = this.setBreakLine;
    }

    return newProps;
  };

  getHC = (id, index) => {
    return _.get(this.props, `custom.limits[${id}][${index}].high`, 'N/A');
  };

  getLC = (id, index) => {
    return _.get(this.props, `custom.limits[${id}][${index}].low`, 'N/A');
  };


  scaleValue = (value) => {
    return this.props.scale ? parseFloat(this.props.scale.invert(value)).toFixed(1) : value;
  }

  processValue = (value) => {
    if (!value || value === 'N/A') {
      return 'N/A';
    }

    const unit = ((this.props.custom.unit || '') === '%') ? '%' : '';
    return `${value}${unit}`;
  };

  setTitle = () => {
    setTimeout(() => {
      d3.select(this.chart.element).select('svg')
        .insert('desc', ':first-child')
        .text(this.props.desc);
      d3.select(this.chart.element).select('svg')
        .insert('title', ':first-child')
        .text(this.props.title);
    }, 0);
  }

  setBreakLine = () => {
    setTimeout(() => {
      d3.select(this.chart.element).select('svg')
        .selectAll('g')
        .filter('.c3-axis-y')
        .select('path.domain')
        .attr('d', this.breakScale(6, 5, 3, 3));
    }, 0);
  }

  /** Break Scale
   * This function creates a new vertical y axis line with a break
   * @param {number} amplitude - amplitude of break
   * @param {number} wavelength - wavelength of break
   * @param {number} periods - how many points are in the break
   * @param {number} dist - distance of break from bottom of y axis
   * @return {object} - d3 line path data generator
   */
  breakScale = (amplitude, wavelength, periods, dist) => {
    const yMin = this.chart.internal.yMin;
    const lineFunction = d3.svg.line()
                           .x((d) => { return d.x; })
                           .y((d) => { return d.y; })
                           .interpolate('linear');
    let breakstart = yMin - dist - (wavelength) * periods;

    // build points for new line
    const lineData = [{ x: -6, y: 0 },
                      { x: 0, y: 0 },
                      { x: 0, y: breakstart }];
    // break
    for (let i = 0; i < periods + 1; i++) {
      if (i === 0) {
        breakstart += wavelength / 2;
        lineData.push({ x: (amplitude / 2) * -1, y: breakstart });
      } else if (i === periods) {
        breakstart += wavelength / 2;
        lineData.push({ x: (i % 2 ? (amplitude / 2) : (amplitude / 2) * -1), y: breakstart });
      } else {
        breakstart += wavelength;
        lineData.push({ x: (i % 2 ? amplitude : amplitude * -1), y: breakstart });
      }
    }
    // last
    lineData.push({ x: 0, y: yMin });
    return lineFunction(lineData);
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
  data: PropTypes.object.isRequired,
  title: PropTypes.string,
  scale: PropTypes.func
};
