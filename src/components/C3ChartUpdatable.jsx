import { PropTypes } from 'react';
import C3Chart from 'react-c3js';
import _ from 'lodash';

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
    const props = Object.assign({}, this.props, {
      tooltip: {
        format: {
          value: (value, ratio, id, index) => {
            const lc = `${this.getLC(id, index)}${this.getUnit()}`;
            const hc = `${this.getHC(id, index)}${this.getUnit()}`;
            return `${value}${this.getUnit()} (${lc} - ${hc})`;
          }
        }
      }
    });

    this.updateChart(props);
  }
}

C3ChartUpdatable.propTypes = {
  data: PropTypes.object.isRequired
};
