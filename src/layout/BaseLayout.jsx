import React, { PropTypes } from 'react';
import DataSources from 'components/DataSources';
import MainFilterContainer from 'containers/MainFilterContainer';
import styles from 'styles/BaseLayout.css';

const BaseLayout = ({ config = {}, dataSources = {} }) => {
  // @TODO grab from store
  const selectedIndicator = {
    id: 'AL002',
    label: 'Mean days of activity limitation'
  };

  const intro = (!config.intro) ? null :
    <p className={styles.appIntro}>{config.intro}</p>;

  const footnote = (!config.footnote) ? null :
    <p>{config.footnote}</p>;

  return (
    <div className="indicator-explorer-app">
      <h1 className={styles.appTitle}>
        {config.title || 'Indicator Explorer'}
      </h1>
      {intro}
      <MainFilterContainer
        customClass={styles.mainFilter}
        intro={config.filter_intro}
      />
      <h2 className={styles.sectionTitle}>
        {selectedIndicator.label || ''}
      </h2>
      <div>
        chart data container
      </div>
      <div className={styles.footnote}>
        {footnote}
        <DataSources
          childClassName={styles.dataSources}
          dataLabel={config.source_data_label || 'Data:'}
          dataSource={dataSources[selectedIndicator.id] || {}}
          sourceLabel={config.source_system_label || 'Source:'}
        />
      </div>
    </div>
  );
};

BaseLayout.propTypes = {
  config: PropTypes.object,
  dataSources: PropTypes.object
};

export default BaseLayout;
