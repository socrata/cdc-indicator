import React, { Component, PropTypes } from 'react';
import Choropleth from '../components/Choropleth';
import DataFilter from '../containers/DataFilter';
import { CONFIG } from '../constants';
import _ from 'lodash';

export default class Map extends Component {

  componentWillReceiveProps(nextProps) {
    const { loadData,
            filter } = this.props;

    // on initial load, year is not set; do not load data until year is set
    if (!nextProps.filter.year) {
      return;
    }

    // while switching breakout category, component is loaded w/o valid breakoutid
    if (nextProps.filter.breakoutcategoryid !== 'GPOVER' && !nextProps.filter.breakoutid) {
      return;
    }

    // if breakout category is set, load data only if a valid breakoutID is specified
    // (this happens as components are refreshed while selecting a different category)
    const options = _.get(CONFIG, `breakouts[${nextProps.filter.breakoutcategoryid}].options`);
    if (options) {
      const validIds = options.map((row) => row.value);
      if (validIds.indexOf(nextProps.filter.breakoutid) === -1) {
        return;
      }
    }

    if (!_.isEqual(nextProps.filter, filter)) {
      // if breakout category is overall, don't pass breakoutid
      if (nextProps.filter.breakoutcategoryid === 'GPOVER') {
        loadData(_.omit(nextProps.filter, 'breakoutid'));
      } else {
        loadData(nextProps.filter);
      }
    }
  }

  render() {
    const { data,
            filter,
            onClick } = this.props;

    let filters = [];

    // use main filter to determine which secondary filters are applicable
    // do not display if selected breakout is "Overall"
    if (filter.breakoutcategoryid && filter.breakoutcategoryid !== 'GPOVER') {
      filters.push(CONFIG.breakouts[filter.breakoutcategoryid]);
    }

    return (
      <div>
        <DataFilter filters={filters} />
        <Choropleth data={data} onClick={onClick} />
      </div>
    );
  }
}

Map.propTypes = {
  data: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};
