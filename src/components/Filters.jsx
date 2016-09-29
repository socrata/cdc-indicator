/**
 * Wrapper for <Filter>
 */

import React, { PropTypes } from 'react';
import Filter from '../components/Filter';

const Filters = ({ filters, onChange }) => (
  <div>
    {filters.map(filter =>
      <Filter
        key={filter.name}
        onChange={onChange}
        {...filter}
      />
    )}
  </div>
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
  onChange: PropTypes.func.isRequired
};

export default Filters;
