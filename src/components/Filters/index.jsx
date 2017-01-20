/**
 * Wrapper for <Filter>
 */

import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Grid from 'layouts/Grid';
import styles from 'styles/spinner.css';
import Filter from './Filter';

class Filters extends Component {
  componentWillMount() {
    if (this.props.loadFilters) {
      this.props.loadFilters();
    }
  }

  render() {
    const { customClass,
            error,
            errorMessage,
            fetching,
            filters,
            intro,
            onFilterChange,
            selected,
            zoomToState } = this.props;

    let loadingElement;
    // only render after config is loaded
    if (fetching) {
      loadingElement = (
        <div className={styles.shortSpinnerOverlay}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch"></i>
          </p>
          <p>
            Updating Filters...
          </p>
        </div>
      );
    }

    // display error message if something went wrong
    if (error) {
      return (
        <div className={styles.shortSpinner}>
          <p>
            <i className="fa fa-exclamation-circle"></i>
          </p>
          <p>
            {errorMessage}
          </p>
        </div>
      );
    }

    const introContent = (!intro) ? null :
      <p>{intro}</p>;

    const filterElements = filters.map((filter, index) => {
      if (filter) {
        const selectedValue = _.get(selected, `[${filter.name}].id`);
        if (selectedValue) {
          return (
            <Filter
              key={index}
              onChange={onFilterChange}
              zoomToState={zoomToState}
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
        <Grid>
          {filterElements}
        </Grid>
      </div>
    );
  }
}

Filters.propTypes = {
  // from redux store
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  fetching: PropTypes.bool,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      name: PropTypes.string,
      options: PropTypes.array,
      optionGroups: PropTypes.array,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    })
  ),
  loadFilters: PropTypes.func,
  onFilterChange: PropTypes.func,
  selected: PropTypes.object,
  zoomToState: PropTypes.func,
  // from parent
  customClass: PropTypes.string,
  intro: PropTypes.string
};

Filters.defaultProps = {
  filters: []
};

export default Filters;
