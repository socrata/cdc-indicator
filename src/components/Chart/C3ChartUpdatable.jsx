// vendors
import { findDOMNode } from 'react-dom';
import C3Chart from 'react-c3js';
import d3 from 'd3';
import c3 from 'c3';
import _get from 'lodash/get';
// import _isEqual from 'lodash/isEqual';
import _some from 'lodash/some';

class C3ChartUpdatable extends C3Chart {
  formatTooltips = (originalProps) => {
    let newProps;
    // override tooltip format
    if (_get(originalProps, 'data.type') !== 'pie') {
      newProps = {
        ...originalProps,
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
            const hasConfidenceLimits = _some(data, (obj) => {
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
      };
    } else {
      newProps = {
        ...originalProps,
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
      };
    }

    newProps.onrendered = this.setTitle;

    if (_get(originalProps, 'data.type') === 'line') {
      newProps.onrendered = this.setBreakLine;
    }

    // newProps.unloadBeforeLoad = true;

    return newProps;
  };

  getHC = (id, index) => _get(this.props, `custom.limits[${id}][${index}].high`, 'N/A');

  getLC = (id, index) => _get(this.props, `custom.limits[${id}][${index}].low`, 'N/A');

  scaleValue = (value) => { // eslint-disable-line arrow-body-style
    return (this.props.scale)
      ? parseFloat(this.props.scale.invert(value)).toFixed(1)
      : value;
  };

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
        .text(this.props.customTitle);
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
    const { yMin } = this.chart.internal;
    const lineFunction = d3.svg.line()
      .x((d) => d.x)
      .y((d) => d.y)
      .interpolate('linear');
    let breakstart = yMin - dist - ((wavelength) * periods);

    // build points for new line
    const lineData = [
      { x: -6, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: breakstart }
    ];
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

  // override generateChart because in C3Chart (super),
  // it doesn't have "c3" defined because we overrode componentDidMount()
  generateChart = (mountNode, config) => {
    const newConfig = {
      bindto: mountNode,
      ...config
    };
    return c3.generate(newConfig);
  }

  // override updateChart behavior to that of 0.1.11
  // where charts are destroyed
  updateChart = (config) => {
    if (this.chart) {
      this.destroyChart();
    }

    // eslint-disable-next-line react/no-find-dom-node
    this.chart = this.generateChart(findDOMNode(this), config);
  }

  componentWillReceiveProps(nextProps) {
    // if (!_isEqual(nextProps.data.columns, this.props.data.columns)) {
    //   const props = this.formatTooltips(nextProps);
    //   this.updateChart(props);
    // }
    const props = this.formatTooltips(nextProps);
    this.updateChart(props);
  }

  componentDidMount() {
    const props = this.formatTooltips(this.props);
    this.updateChart(props);
  }
}

export default C3ChartUpdatable;
