/**
 * Wrapper for <Filter>
 */

/** dependencies **/
// vendors
import React, { PropTypes } from 'react';
// custom
import Grid from '../components/Grid';
import Filter from '../components/Filter';

const Filters =
  ({ filters, onChange, onLoad, customClass, currentFilter, intro, onStateChange }) => {
    if (filters.length === 0) {
      return null;
    }

    const introContent = (intro) ? (
      <p>{intro}</p>
    ) : null;

    return (
      <div className={customClass}>
        {introContent}
        <Grid>
          {filters.map(filter =>
            <Filter
              key={filter.name}
              onChange={onChange}
              onLoad={onLoad}
              currentValue={currentFilter[filter.name] || undefined}
              onStateChange={(filter.name === 'locationabbr') ? onStateChange : undefined}
              {...filter}
            />
          )}
        </Grid>
      </div>
    );
  };

Filters.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      defaultLabel: PropTypes.string.isRequired,
      options: PropTypes.array,
      optionGroups: PropTypes.array
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  customClass: PropTypes.string,
  currentFilter: PropTypes.object,
  intro: PropTypes.string,
  onStateChange: PropTypes.func
};

export default Filters;
