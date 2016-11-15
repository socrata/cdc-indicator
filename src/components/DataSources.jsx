import React, { PropTypes } from 'react';

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
        (!url) ? textElement :
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >{textElement}</a>
      }
    </p>
  );

  return (
    <div className={style}>
      {element}
    </div>
  );
}

const DataSources = ({ childClassName, dataLabel, dataSource, sourceLabel }) => {
  const { data_label,
          data_link,
          source_label,
          source_link } = dataSource;

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
  childClassName: PropTypes.string,
  dataLabel: PropTypes.string,
  dataSource: PropTypes.object,
  sourceLabel: PropTypes.string
};

export default DataSources;
