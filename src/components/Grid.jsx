/**
 * Helper to wrap elements into a grid layout
 */

/** dependencies **/
// vendors
import React, { PropTypes } from 'react';
import _ from 'lodash';
// styles
import styles from '../styles/grid.css';

function getGridStyle(length) {
  switch (length) {
    case 1:
      return 'gridFull';
    case 2:
      return 'gridHalf';
    default:
      return 'gridThird';
  }
}

const Grid = ({ children, customClass, customChildClass }) => {
  const childrenArray = _.castArray(children);
  const gridStyle = getGridStyle(childrenArray.length);
  const childElements = childrenArray.map((child, index) => (
    <div key={index} className={`${styles[gridStyle]} ${customChildClass || ''}`}>
      {child}
    </div>
  ));

  return (
    <div className={`${styles.row} ${customClass || ''}`}>
      {childElements}
    </div>
  );
};

Grid.propTypes = {
  customClass: PropTypes.string,
  customChildClass: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};

export default Grid;
