/**
 * Generate a <select> element (dropdown) for filtering data.
 * Pass an array of options, or key:value pairs of option groups
 */

import React, { PropTypes } from 'react';
import styles from 'styles/filter.css';

function createOption(data, index) {
  const { text,
          value } = data;
  return <option key={index} value={value}>{text || value}</option>;
}

const Filter = ({
  label, name, onChange, options, optionGroups, value
}) => {
  let optionElements;

  if (optionGroups) {
    optionElements = optionGroups.map((group, index) => {
      const innerOptions = group.options.map(createOption);
      return (
        <optgroup key={index} label={group.text}>
          {innerOptions}
        </optgroup>
      );
    });
  } else {
    optionElements = options.map(createOption);
  }

  return (
    <div className={styles.filter}>
      <label>{`${label}:`}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
      >
        {optionElements}
      </select>
    </div>
  );
};

Filter.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired
    })
  ),
  optionGroups: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string,
          value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
          ]).isRequired
        })
      )
    })
  ),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default Filter;
