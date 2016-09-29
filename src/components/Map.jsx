import React, { Component, PropTypes } from 'react';
import Choropleth from '../components/Choropleth';
import MapFilter from '../containers/MapFilter';

import breakouts from '../config/breakouts.yml';

export default class Map extends Component {

  componentWillMount() {
    const { loadData,
            filter,
            mapFilter } = this.props;

    loadData(filter, mapFilter);
  }

  render() {
    const { data,
            filter } = this.props;

    let filters = [breakouts.year];

    // use main filter to determine which secondary filters are applicable
    // display filter for year only if selected breakout is "Overall"
    if (filter.breakoutcategoryid !== 'GPOVER') {
      filters.push(breakouts[filter.breakoutcategoryid]);
    }

    return (
      <div>
        <MapFilter filters={filters} />
        <Choropleth data={data} />
      </div>
    );
  }
}

Map.propTypes = {
  data: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  mapFilter: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired
};
