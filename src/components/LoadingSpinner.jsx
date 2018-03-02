import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import styles from 'styles/LoadingSpinner.scss';

const LoadingSpinner = ({ text, shortDisplay }) => (
  <div className={(shortDisplay) ? 'spinner-short' : 'spinner'}>
    <p>
      <i className="fa fa-spin fa-circle-o-notch" />
    </p>
    {
      (text) ? <p>{text}</p> : null
    }
  </div>
);

LoadingSpinner.propTypes = {
  shortDisplay: PropTypes.bool,
  text: PropTypes.string
};

LoadingSpinner.defaultProps = {
  shortDisplay: false,
  text: undefined
};

export default cssModules(LoadingSpinner, styles);
