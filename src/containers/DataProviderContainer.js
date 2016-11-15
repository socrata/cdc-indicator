import { connect } from 'react-redux';
import _ from 'lodash';
import { fetchData, setCompareFlag } from 'modules/indicatorData';
import ChartArea from 'components/ChartArea';
import { CONFIG } from 'constants';

const mapStateToProps = (state) => {
  // determine the correct "chart" configuration to use for a selected indicator
  let chartConfiguration;

  if (!state.filters.fetching) {
    const indicator = _.get(state, `filters.selected[${CONFIG.indicatorId}].id`, 'default');
    const charts = _.get(state, 'appConfig.config.chart', {});

    if (charts.hasOwnProperty(indicator)) {
      chartConfiguration = (charts[indicator] || []).slice(0, 3);
    } else {
      chartConfiguration = (charts.default || []).slice(0, 3);
    }
  }

  return {
    chartConfiguration,
    compareToNational: state.indicatorData.compareToNational,
    error: state.indicatorData.error,
    errorMessage: state.indicatorData.errorMessage,
    fetching: state.indicatorData.fetching,
    isFilterReady: !state.filters.fetching && !state.filters.error,
    latestYear: state.indicatorData.latestYear,
    rawData: state.indicatorData.data,
    selectedFilters: state.filters.selected
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadData: () => {
      dispatch(fetchData());
    },
    setCompareFlag: (status) => {
      dispatch(setCompareFlag(status));
    }
  };
};

const DataProviderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartArea);

export default DataProviderContainer;
