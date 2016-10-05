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
            onLoad } = this.props;

    onLoad(name, defaultValue);
  }

  componentWillReceiveProps(nextProps) {
    const { defaultValue,
            onLoad } = this.props;

    // when filter is rendered with a different defaultValue, reset value
    if (defaultValue !== nextProps.defaultValue) {
      onLoad(nextProps.name, nextProps.defaultValue);
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
            optionGroups,
            onChange } = this.props;

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
        <label>{label}</label>
        <select name={name} defaultValue={defaultValue} onChange={onChange}>
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
  onLoad: PropTypes.func.isRequired
};
