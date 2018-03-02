/**
 * Generate a <select> element (dropdown) for filtering data.
 * Pass an array of options, or key:value pairs of option groups
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { t } from 'lib/utils';
import { CONFIG } from 'constants/index';
import styles from 'styles/filter.css';

function createOption(data, index) {
  const {
    isDisabled,
    text,
    value
  } = data;

  const disabled = (isDisabled) ? '(No data available)' : '';
  return (
    <option key={index} value={value} disabled={isDisabled || false}>
      {text || value} {disabled}
    </option>
  );
}

class Filter extends Component {
  handleChange = (event) => {
    this.props.onChange(event);

    if (this.props.name === CONFIG.locationId) {
      this.props.zoomToState(event.target.value);
    }
  }

  render() {
    const {
      label,
      name,
      options,
      optionGroups,
      value
    } = this.props;
    let optionElements;

    if (optionGroups.length > 0) {
      optionElements = optionGroups.map((group) => {
        const innerOptions = group.options.map(createOption);
        return (
          <optgroup key={t(group.text)} label={group.text}>
            {innerOptions}
          </optgroup>
        );
      });
    } else {
      optionElements = options.map(createOption);
    }

    // <select> is enclosed in <label>, but eslint does not recognize this
    // React handles onChange and does not fire unless the value changed
    /* eslint-disable jsx-a11y/label-has-for */
    /* eslint-disable jsx-a11y/no-onchange */
    return (
      <div className={styles.filter}>
        <label>
          <span>
            {`${label}:`}
          </span>
          <select
            name={name}
            value={value}
            onChange={this.handleChange}
          >
            {optionElements}
          </select>
        </label>
      </div>
    );
    /* eslint-enable jsx-a11y/no-onchange */
    /* eslint-enable jsx-a11y/label-has-for */
  }
}

Filter.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    isDisabled: PropTypes.bool
  })),
  optionGroups: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired
    }))
  })),
  onChange: PropTypes.func.isRequired,
  zoomToState: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

Filter.defaultProps = {
  options: [],
  optionGroups: [],
  zoomToState: () => {}
};

export default Filter;
