import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import ChartData from 'lib/ChartData';
import styles from 'styles/dataTable.css';

const modalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    maxHeight: '80%',
    transform: 'translate(-50%, -50%)'
  }
};

export default class DataTable extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    dataSeries: PropTypes.oneOf(['trend', 'latest', 'map']),
    chartType: PropTypes.string,
    year: PropTypes.number
  };

  static defaultProps = {
    dataSeries: 'trend'
  };

  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false
    };

    this.onClick = (event) => {
      event.preventDefault();
      this.setState({
        isModalOpen: !this.state.isModalOpen
      });
    };
  }

  formatLatestData(chartConfig) {
    const caption = _.get(chartConfig, 'axis.y.label.text', '');
    const headers = _.chain(chartConfig)
      .get('data.columns', [])
      .map(row => _.get(row, '[0]', ''))
      .value();
    headers.unshift('Breakout');
    const rows = _.chain(chartConfig)
      .get('axis.x.categories', [])
      .map((category, index) => {
        const dataRow = _.chain(chartConfig)
          .get('data.columns', [])
          .map(row => _.get(row, `[${index + 1}]`) || 'N/A')
          .value();
        dataRow.unshift(category);
        return dataRow;
      })
      .value();

    return {
      caption,
      headers,
      rows,
      hasData: headers.length > 0 && rows.length > 0
    };
  }

  formatMapData(data) {
    if (!data.hasOwnProperty('features')) {
      return {};
    }

    const caption = 'Data by Location';
    const headers = ['Location', 'Value'];
    const rows = _.chain(data.features)
      .map(feature =>
        [
          feature.properties.name,
          (feature.properties.value) ?
            `${feature.properties.value}${feature.properties.unit || ''}` :
            'N/A'
        ]
      )
      .sortBy(row => row[0])
      .value();

    return {
      caption,
      headers,
      rows,
      hasData: headers.length > 0 && rows.length > 0
    };
  }

  formatPieData(chartConfig) {
    const caption = 'Data by Breakout';
    const labels = _.get(chartConfig, 'data.columns', []).map(x => x[0]);
    const values = _.get(chartConfig, 'data.columns', []).map(x => x[1]);
    const sum = _.sum(values);
    const ratios = values.map(x => _.round((x / sum * 100), 1));
    const headers = ['Breakout', 'Value', 'Ratio'];
    const rows = labels.map((label, index) => [label, values[index], `${ratios[index]}%`]);

    return {
      caption,
      headers,
      rows,
      hasData: headers.length > 0 && rows.length > 0
    };
  }

  formatTrendData(chartConfig) {
    const caption = _.get(chartConfig, 'axis.y.label.text', '');
    const headers = _.chain(chartConfig)
      .get('data.columns', [])
      .find(x => x[0] === 'year')
      .slice(1)
      .value();
    headers.unshift('Location - Breakout');
    const rows = _.chain(chartConfig)
      .get('data.columns', [])
      .filter(x => x[0] !== 'year')
      .map(row => row.map(cell => cell || 'N/A'))
      .value();

    return {
      caption,
      headers,
      rows,
      hasData: headers.length > 0 && rows.length > 0
    };
  }

  render() {
    const { data,
            dataSeries,
            chartType,
            year } = this.props;

    let chartConfig;
    let tableData = {};

    switch (chartType) {
      case 'map':
        tableData = this.formatMapData(data);
        break;
      case 'pie':
        chartConfig = new ChartData({
          data,
          dataSeries: 'pie',
          year
        }).chartConfig();
        tableData = this.formatPieData(chartConfig);
        break;
      default:
        chartConfig = new ChartData({
          data,
          dataSeries,
          year
        }).chartConfig();
        switch (dataSeries) {
          case 'trend':
            tableData = this.formatTrendData(chartConfig);
            break;
          case 'latest':
            tableData = this.formatLatestData(chartConfig);
            break;
          default:
        }
    }

    let table = null;

    if (tableData.hasData) {
      table = (
        <table className={styles.dataTable}>
          <caption>{tableData.caption}</caption>
          <thead>
            <tr>
              {
                tableData.headers.map((header, index) =>
                  <th key={index} scope="col">{header}</th>
                )
              }
            </tr>
          </thead>
          <tbody>
            {
              tableData.rows.map((row, index) =>
                <tr key={index}>
                  {
                    row.map((cell, i) => {
                      if (i === 0) {
                        return <th key={i} scope="row">{cell}</th>;
                      }
                      return <td key={i}>{cell}</td>;
                    })
                  }
                </tr>
              )
            }
          </tbody>
        </table>
      );
    }

    return (
      <div className={styles.linkContainer}>
        <a
          href="#"
          className={styles.openTable}
          onClick={this.onClick}
        >
          View data as a table
        </a>
        <Modal
          isOpen={this.state.isModalOpen}
          style={modalStyles}
        >
          {table}
          <button className={styles.closeTable} onClick={this.onClick}>Close</button>
        </Modal>
      </div>
    );
  }
}
