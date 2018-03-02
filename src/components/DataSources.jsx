import React from 'react';
import PropTypes from 'prop-types';

function createElement(label, url, text, style) {
  if (!url && !text) {
    return null;
  }

  const textElement = text || 'Link';
  const element = (
    <p>
      {label}:
      {' '}
      {
        (!url)
          ? textElement
          : (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {textElement}
            </a>
          )
      }
    </p>
  );

  return (
    <div className={style}>
      {element}
    </div>
  );
}

const DataSources = ({
  childClassName,
  dataLabel,
  dataSource,
  sourceLabel
}) => {
  /* eslint-disable camelcase */
  const {
    data_label,
    data_link,
    source_label,
    source_link
  } = dataSource;
  /* eslint-enable camelcase */

  const sourceElement = createElement(sourceLabel, source_link, source_label, childClassName);
  const dataElement = createElement(dataLabel, data_link, data_label, childClassName);

  return (
    <div>
      {sourceElement}
      {dataElement}
    </div>
  );
};

DataSources.propTypes = {
  childClassName: PropTypes.string.isRequired,
  dataLabel: PropTypes.string.isRequired,
  dataSource: PropTypes.shape({
    data_label: PropTypes.string,
    data_link: PropTypes.string,
    source_label: PropTypes.string,
    source_link: PropTypes.string
  }).isRequired,
  sourceLabel: PropTypes.string.isRequired
};

export default DataSources;
