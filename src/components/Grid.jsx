import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import _castArray from 'lodash/castArray';
import styles from 'styles/grid.scss';

/* eslint-disable react/no-array-index-key */
const Grid = ({ children, customClassChildren, customClassParent }) => (
  <div styleName="container" className={customClassParent}>
    {
      _castArray(children).map((child, index) => (
        <div key={`flex-grid-child-${index}`} styleName="child" className={customClassChildren}>
          {child}
        </div>
      ))
    }
  </div>
);
/* eslint-enable react/no-array-index-key */

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  customClassChildren: PropTypes.string,
  customClassParent: PropTypes.string
};

Grid.defaultProps = {
  customClassChildren: undefined,
  customClassParent: undefined
};

export default cssModules(Grid, styles);
