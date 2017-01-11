/**
 * Generate a <select> element (dropdown) for filtering data.
 * Pass an array of options, or key:value pairs of option groups
 */

import React, { Component, PropTypes } from 'react';
import { CONFIG } from 'constants';
import styles from 'styles/filter.css';

function createOption(data, index) {
  const { isDisabled,
          text,
          value } = data;

  const disabled = (isDisabled) ? '(No data available)' : '';
  return (
    <option key={index} value={value} disabled={isDisabled || false}>
      {text || value} {disabled}
    </option>
  );
}

export default class Filter extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]).isRequired,
        isDisabled: PropTypes.bool
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
    onChange: PropTypes.func,
    zoomToState: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired
  };

  constructor(props) {
    super(props);

    this.handleChange = (event) => {
      this.props.onChange(event);

      if (this.props.name === CONFIG.locationId) {
        this.props.zoomToState(event.target.value);
      }
    };
  }

  render() {
    const { label,
            name,
            options,
            optionGroups,
            value } = this.props;
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
  }
}
