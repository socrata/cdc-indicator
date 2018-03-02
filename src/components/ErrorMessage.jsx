import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import styles from 'styles/ErrorMessage.scss';

const ErrorMessage = ({ text, shortDisplay }) => (
  <div className={(shortDisplay) ? 'spinner-short' : 'spinner'}>
    <p>
      <i className="fa fa-exclamation-circle" />
    </p>
    {
      (text) ? <p>{text}</p> : null
    }
  </div>
);

ErrorMessage.propTypes = {
  shortDisplay: PropTypes.bool,
  text: PropTypes.string.isRequired
};

ErrorMessage.defaultProps = {
  shortDisplay: false
};

export default cssModules(ErrorMessage, styles);
