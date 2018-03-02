/**
 * Wrapper for <Filter>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import Grid from 'components/Grid';
import Filter from 'components/Filter';
import LoadingSpinner from 'components/LoadingSpinner';
import ErrorMessage from 'components/ErrorMessage';
import { t } from 'lib/utils';
import styles from 'styles/Filters.scss';

class Filters extends Component {
  componentWillMount() {
    if (this.props.loadFilters) {
      this.props.loadFilters();
    }
  }

  render() {
    const {
      customClass,
      error,
      errorMessage,
      fetching,
      filters,
      intro,
      onFilterChange,
      selected,
      zoomToStateFn
    } = this.props;

    let loadingElement;
    // only render after config is loaded
    if (fetching) {
      loadingElement = (
        <LoadingSpinner text="Updating Filters..." shortDisplay />
      );
    }

    // display error message if something went wrong
    if (error) {
      return (
        <ErrorMessage text={errorMessage} shortDisplay />
      );
    }

    const introContent = (!intro) ? null : <p>{intro}</p>;

    const filterElements = filters.map((filter) => {
      if (filter) {
        const selectedValue = _get(selected, `[${filter.name}].id`);
        if (selectedValue) {
          return (
            <Filter
              key={t(filter.label)}
              onChange={onFilterChange}
              zoomToState={zoomToStateFn}
              value={selectedValue}
              {...filter}
            />
          );
        }
      }

      return undefined;
    }).filter(row => row !== undefined);

    return (
      <div className={customClass}>
        {loadingElement}
        {introContent}
        <Grid customClassChildren={styles.child}>
          {filterElements}
        </Grid>
      </div>
    );
  }
}

Filters.propTypes = {
  // props from parent
  customClass: PropTypes.string,
  intro: PropTypes.string,
  // Redux states
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetching: PropTypes.bool.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    options: PropTypes.array,
    optionGroups: PropTypes.array,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  })).isRequired,
  selected: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  // Redux dispatches
  loadFilters: PropTypes.func,
  onFilterChange: PropTypes.func.isRequired,
  zoomToStateFn: PropTypes.func
};

Filters.defaultProps = {
  customClass: undefined,
  errorMessage: undefined,
  intro: undefined,
  loadFilters: () => {},
  zoomToStateFn: () => {}
};

export default Filters;
