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

const Grid = ({ additionalClasses, children }) => {
  const childrenArray = _.castArray(children);
  const gridStyle = getGridStyle(childrenArray.length);
  const childElements = childrenArray.map((child, index) => (
    <div key={index} className={styles[gridStyle]}>
      {child}
    </div>
  ));

  return (
    <div className={`${styles.row} ${additionalClasses || ''}`}>
      {childElements}
    </div>
  );
};

Grid.propTypes = {
  additionalClasses: PropTypes.string,
  children: PropTypes.element
};

export default Grid;
