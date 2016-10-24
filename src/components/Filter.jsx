/**
 * Generate a <select> element (dropdown) for filtering data.
 * Pass an array of options, or key:value pairs of option groups
 */

/** dependencies **/
// vendors
import React, { Component, PropTypes } from 'react';
// styles
import styles from '../styles/filter.css';

export default class Filter extends Component {

  componentDidMount() {
    const { name,
            defaultValue,
            defaultLabel,
            onLoad,
            onChange,
            onStateChange } = this.props;

    onLoad(name, defaultValue, defaultLabel);

    this.changeFilter = (event) => {
      if (onStateChange) {
        onStateChange(event);
      }

      onChange(event);
    };
  }

  componentWillReceiveProps(nextProps) {
    const { defaultValue,
            onLoad } = this.props;

    // when filter is rendered with a different defaultValue, reset value
    if (defaultValue !== nextProps.defaultValue) {
      onLoad(nextProps.name, nextProps.defaultValue);
    }

    // if a new currentValue is passed in, but existing value is different select that value
    if (nextProps.currentValue !== this.select.value) {
      this.select.value = nextProps.currentValue;
    }
  }

  // generate <option> element
  createOption(data) {
    const { text,
            value } = data;

    return <option key={value} value={value}>{text || value}</option>;
  }

  render() {
    const { label,
            name,
            defaultValue,
            options,
            optionGroups } = this.props;

    let optionElements;

    if (optionGroups) {
      optionElements = optionGroups.map((group) => {
        const innerOptions = group.options.map(this.createOption);
        return (
          <optgroup key={group.text} label={group.text}>
            {innerOptions}
          </optgroup>
        );
      });
    } else {
      optionElements = options.map(this.createOption);
    }

    return (
      <div className={styles.filter}>
        <label>{`${label}:`}</label>
        <select
          name={name}
          defaultValue={defaultValue}
          onChange={this.changeFilter}
          ref={(ref) => {
            if (ref) {
              this.select = ref;
            }
          }}
        >
          {optionElements}
        </select>
      </div>
    );
  }
}

Filter.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  defaultLabel: PropTypes.string.isRequired,
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
  onLoad: PropTypes.func.isRequired,
  onStateChange: PropTypes.func
};
