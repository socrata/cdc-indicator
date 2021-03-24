import React from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import _get from 'lodash/get';
import DataSources from 'components/DataSources';
import ChartsContainer from 'containers/ChartsContainer';
import FiltersContainer from 'containers/FiltersContainer';
import { CONFIG } from 'constants/index';
import styles from 'styles/BaseLayout.scss';

const BaseLayout = ({
  config,
  dataSources,
  selectedFilters
}) => {
  const selectedIndicator = _get(selectedFilters, `${CONFIG.indicatorId}.id`);

  const intro = (!config.intro)
    ? null
    : <p className={styles.appIntro}>{config.intro}</p>;

  const footnote = (!config.footnote)
    ? null
    : <p>{config.footnote}</p>;

  return (
    <div className="indicator-explorer-app">
      <h1 styleName="appTitle">
        {config.title || 'Indicator Explorer'}
      </h1>
      {intro}
      <FiltersContainer
        customClass={styles.mainFilter}
        intro={config.filter_intro}
      />
      <ChartsContainer
        customParentClass={styles.chartGrid}
        customChildClass={styles.chartContainer}
      />
      <div styleName="footnote">
        {footnote}
        <DataSources
          childClassName={styles.dataSources}
          dataLabel={config.source_data_label || 'Data:'}
          dataSource={dataSources[selectedIndicator] || {}}
          sourceLabel={config.source_system_label || 'Source:'}
        />
      </div>
    </div>
  );
};

BaseLayout.propTypes = {
  config: PropTypes.shape({
    data_points: PropTypes.string,
    filter_intro: PropTypes.string,
    footnote: PropTypes.string,
    intro: PropTypes.string,
    source_data_label: PropTypes.string,
    source_system_label: PropTypes.string,
    title: PropTypes.string
  }).isRequired,
  dataSources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedFilters: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default cssModules(BaseLayout, styles);
