import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
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

class DataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      originalLink: null
    };
  }

  // when Modal is closed, put focus back on the original link that was used
  closeModal = () => {
    this.setState({
      isModalOpen: false
    });
    this.state.originalLink.focus();
  };

  openModal = (event) => {
    this.setState({
      isModalOpen: true,
      originalLink: event.target
    });
  };

  render() {
    const { isForMap,
            latestYear,
            rawData,
            showOnlyLatest } = this.props;

    let table;
    let tableContent = 'Data Table';
    let displayData = rawData;

    if (showOnlyLatest) {
      displayData = rawData.filter(row => row.year === latestYear);
    }

    if (rawData.length > 0) {
      const unit = _.get(displayData, '[0].data_value_unit');

      const columnsToRender = {
        year: {
          header: 'Year',
          th: true
        },
        locationdesc: {
          header: 'Location',
          th: true
        },
        stratification1: {
          header: 'Breakout',
          th: true
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
        }
      };

      const caption = captionColumns.map((column, index) => (
        <div key={index}>
          {rawData[0][column]}
          {(column === 'data_value_type' && unit) ? ` (${unit})` : ''}
        </div>
      ));

      let additionalCaption = 'Values over time';

      if (showOnlyLatest) {
        additionalCaption = 'Values from latest year';
      } else if (isForMap) {
        additionalCaption = 'Values across the United States';
      }

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

              if (columnsToRender[column].th) {
                let year = '';
                if (columnsToRender[column].header === 'Year' && +row.year !== +row.yearend) {
                  year = `${row[column]} - ${row.yearend}`;
                } else {
                  year = `${row[column]}`;
                }
                return (
                  <th key={i} scope="row" className={columnsToRender[column].header}>{
                  year
                  || 'N/A'}</th>
                );
              }
              return (
                <td key={i} className={style}>{row[column] || 'N/A'}</td>
              );
            })
          }

        </tr>
      ));

      tableContent = captionColumns.map(column => rawData[0][column]).join(' ');

      if (unit) {
        tableContent = `${tableContent} (${unit})`;
      }

      const summary = [
        `This table displays ${tableContent}.`,
        'The columns in the header row show labels of data values shown in the table.',
        'The table contains rows of data values for year, location and breakout categories.'
      ].join(' ');

      table = (
        <table className={styles.dataTable} summary={summary}>
          <caption>
            {caption}
            <div className={styles.additionalCaption}>
              {additionalCaption}
            </div>
          </caption>
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
        <button
          href="#"
          className={styles.openTable}
          onClick={this.openModal}
          aria-hidden="true"
        >
          View data as a table
        </button>
        {hiddenTable}
        <Modal
          isOpen={this.state.isModalOpen}
          onRequestClose={this.closeModal}
          style={modalStyles}
          contentLabel={tableContent}
        >
          {table}
          <button className={styles.closeTable} onClick={this.closeModal}>Close</button>
        </Modal>
      </div>
    );
  }
}

DataTable.propTypes = {
  isForMap: PropTypes.bool,
  latestYear: PropTypes.number,
  rawData: PropTypes.array,
  showOnlyLatest: PropTypes.bool
};

DataTable.defaultProps = {
  showOnlyLatest: false
};

export default DataTable;
