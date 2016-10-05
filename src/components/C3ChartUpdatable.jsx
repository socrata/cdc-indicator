import React from 'react';
import C3Chart from 'react-c3js';
import _ from 'lodash';

export default class C3ChartUpdatable extends C3Chart {
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
}

C3ChartUpdatable.propTypes = {
  data: React.PropTypes.object.isRequired
};
