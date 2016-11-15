import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal';
// import _ from 'lodash';
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

const captionColumns = [
  'topic',
  'question',
  'data_value_type'
];

const columnsToRender = {
  year: {
    header: 'Year'
  },
  locationdesc: {
    header: 'Location'
  },
  stratification1: {
    header: 'Breakout'
  },
  data_value: {
    header: 'Value',
    align: 'right'
  },
  low_confidence_limit: {
    header: 'Low Confidence Limit',
    align: 'right'
  },
  high_confidence_limit: {
    header: 'High Confidence Limit',
    align: 'right'
  },
  data_value_unit: {
    header: 'Unit'
  }
};

export default class DataTable extends Component {
  static propTypes = {
    latestYear: PropTypes.number,
    rawData: PropTypes.array,
    showOnlyLatest: PropTypes.bool
  };

  static defaultProps = {
    showOnlyLatest: false
  };

  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      originalLink: null
    };

    this.onClick = (event) => {
      event.preventDefault();
      this.setState({
        isModalOpen: !this.state.isModalOpen,
        originalLink: event.target
      });
    };

    // when Modal is closed, put focus back on the original link that was used
    this.onRequestClose = () => {
      this.state.originalLink.focus();
    };
  }

  render() {
    const { latestYear,
            rawData,
            showOnlyLatest } = this.props;

    let table;
    let displayData = rawData;

    if (showOnlyLatest) {
      displayData = rawData.filter(row => row.year === latestYear);
    }

    if (rawData.length > 0) {
      const caption = captionColumns.map((column, index) => (
        <div key={index}>
          {rawData[0][column]}
        </div>
      ));

      const header = Object.keys(columnsToRender).map((column, index) => (
        <th key={index} scope="col">
          {columnsToRender[column].header}
        </th>
      ));

      const rows = displayData.map((row, index) => (
        <tr key={index}>
          {
            Object.keys(columnsToRender).map((column, i) => {
              let style;
              if (columnsToRender[column].align) {
                style = styles[columnsToRender[column].align];
              }

              return (
                <td key={i} className={style}>{row[column] || 'N/A'}</td>
              );
            })
          }
        </tr>
      ));

      table = (
        <table className={styles.dataTable}>
          <caption>{caption}</caption>
          <thead>
            <tr>{header}</tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      );
    }

    let hiddenTable;
    if (!this.state.isModalOpen) {
      hiddenTable = (
        <div className="visually-hidden">
         {table}
        </div>
      );
    }

    return (
      <div className={styles.linkContainer}>
        <a
          href="#"
          className={styles.openTable}
          onClick={this.onClick}
          aria-hidden="true"
        >
          View data as a table
        </a>
        {hiddenTable}
        <Modal
          isOpen={this.state.isModalOpen}
          onRequestClose={this.onRequestClose}
          style={modalStyles}
        >
          {table}
          <button className={styles.closeTable} onClick={this.onClick}>Close</button>
        </Modal>
      </div>
    );
  }
}
