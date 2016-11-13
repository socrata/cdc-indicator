/**
 * Wrapper for <Filter>
 */

import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import Grid from 'layouts/Grid';
import styles from 'styles/spinner.css';
import Filter from './Filter';

export default class Filters extends Component {
  static propTypes = {
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
    // from parent
    customClass: PropTypes.string,
    intro: PropTypes.string
  };

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
            selected } = this.props;

    // only render after config is loaded
    if (fetching) {
      return (
        <div className={styles.shortSpinner}>
          <p>
            <i className="fa fa-spin fa-circle-o-notch"></i>
          </p>
          <p>
            Loading Visualizations...
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

    return (
      <div className={customClass}>
        {introContent}
        <Grid>
          {filters.map((filter, index) =>
            <Filter
              key={index}
              onChange={onFilterChange}
              value={_.get(selected, `[${filter.name}].id`)}
              {...filter}
            />
          )}
        </Grid>
      </div>
    );
  }
}
