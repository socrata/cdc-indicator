import { connect } from 'react-redux';
import _ from 'lodash';
import { fetchData } from 'modules/indicatorData';
import ChartArea from 'components/ChartArea';

const mapStateToProps = (state) => {
  // determine the correct "chart" configuration to use for a selected indicator
  let breakoutColumn;
  let breakoutLabelColumn;
  let chartConfiguration;
  let locationColumn;
  let locationLabelColumn;

  if (!state.filters.fetching) {
    breakoutColumn = _.get(state, 'appConfig.config.core.breakout_id_column');
    breakoutLabelColumn = _.get(state, 'appConfig.config.core.breakout_label_column');
    locationColumn = _.get(state, 'appConfig.config.core.location_id_column');
    locationLabelColumn = _.get(state, 'appConfig.config.core.location_label_column');
    const indicatorColumn = _.get(state, 'appConfig.config.core.indicator_id_column');
    const indicator = _.get(state, `filters.selected[${indicatorColumn}].id`, 'default');
    const charts = _.get(state, 'appConfig.config.chart', {});

    if (charts.hasOwnProperty(indicator)) {
      chartConfiguration = (charts[indicator] || []).slice(0, 3);
    } else {
      chartConfiguration = (charts.default || []).slice(0, 3);
    }
  }

  return {
    breakoutColumn,
    breakoutLabelColumn,
    chartConfiguration,
    error: state.indicatorData.error,
    errorMessage: state.indicatorData.errorMessage,
    fetching: state.indicatorData.fetching,
    isFilterReady: !state.filters.fetching && !state.filters.error,
    latestYear: state.indicatorData.latestYear,
    locationColumn,
    locationLabelColumn,
    rawData: state.indicatorData.data,
    selectedFilters: state.filters.selected
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: () => {
      dispatch(fetchData());
    }
  };
};

const DataProviderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartArea);

export default DataProviderContainer;
