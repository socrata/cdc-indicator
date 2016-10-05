/**
 * Wrapper for <Filter>
 */

/** dependencies **/
// vendors
import React, { PropTypes } from 'react';
// custom
import Grid from '../components/Grid';
import Filter from '../components/Filter';

const Filters = ({ filters, onChange, onLoad }) => (
  <Grid>
    {filters.map(filter =>
      <Filter
        key={filter.name}
        onChange={onChange}
        onLoad={onLoad}
        {...filter}
      />
    )}
  </Grid>
);

Filters.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      options: PropTypes.array,
      optionGroups: PropTypes.array
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired
};

export default Filters;
