import React, { Component, PropTypes } from 'react';
import Choropleth from '../components/Choropleth';
import DataFilter from '../containers/DataFilter';
import _ from 'lodash';

function startsWithVowel(string) {
  return ['a', 'e', 'i', 'o', 'u'].reduce((doesStart, vowel) => {
    return doesStart || string.substring(0, 1) === vowel;
  }, false);
}

export default class Map extends Component {

  componentWillReceiveProps(nextProps) {
    const { loadData,
            filter } = this.props;

    // on initial load, year is not set; do not load data until year is set
    if (!nextProps.year) {
      return;
    }

    // while switching breakout category, component is loaded w/o valid breakoutid
    if (nextProps.filter.breakoutcategoryid !== 'GPOVER' && !nextProps.filter.breakoutid) {
      return;
    }

    // if breakout category is set, load data only if a valid breakoutID is specified
    // (this happens as components are refreshed while selecting a different category)
    const options = _.find(nextProps.filters, { name: 'breakoutid' });
    if (options) {
      const validIds = options.map((row) => row.value);
      if (validIds.indexOf(nextProps.filter.breakoutid) === -1) {
        return;
      }
    }

    if (!_.isEqual(nextProps.filter, filter)) {
      // if breakout category is overall, don't pass breakoutid
      if (nextProps.filter.breakoutcategoryid === 'GPOVER') {
        loadData(_.omit(nextProps.filter, 'breakoutid'), nextProps.year);
      } else {
        loadData(nextProps.filter, nextProps.year);
      }
    }
  }

  render() {
    const { data,
            rawData,
            filter,
            label,
            onClick } = this.props;

    let filters = [];

    // use main filter to determine which secondary filters are applicable
    // do not display if selected breakout is "Overall"
    if (filter.breakoutcategoryid && filter.breakoutcategoryid !== 'GPOVER') {
      // get valid breakout IDs
      const options = _.chain(rawData)
        .map((row) => {
          return {
            text: row.break_out,
            value: row.breakoutid
          };
        })
        .uniqBy('value')
        .sortBy('value')
        .value();

      const currentLabel = label.breakoutcategoryid.toLowerCase();
      const article = (startsWithVowel(currentLabel)) ? 'an' : 'a';

      filters.push({
        label: `Select ${article} ${currentLabel}`,
        name: 'breakoutid',
        defaultValue: options[0].value,
        defaultLabel: options[0].text,
        options
      });
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
  rawData: PropTypes.array.isRequired,
  filter: PropTypes.object.isRequired,
  label: PropTypes.object.isRequired,
  year: PropTypes.number.isRequired,
  loadData: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};
