import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cssModules from 'react-css-modules';
import Modal from 'react-modal';
import _get from 'lodash/get';
import { t } from 'lib/utils';
import styles from 'styles/DataTable.scss';

// set App element for react-modal
Modal.setAppElement('#main');

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
    overflow: 'hidden',
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
    const {
      isDesktopView,
      isForMap,
      latestYear,
      rawData,
      showOnlyLatest
    } = this.props;

    let table;
    let tableContent = 'Data Table';
    let displayData = rawData;

    if (showOnlyLatest) {
      displayData = rawData.filter(row => row.year === latestYear);
    }

    if (rawData.length > 0) {
      const unit = _get(displayData, '[0].data_value_unit');

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

      const caption = captionColumns.map(column => (
        <div key={t(rawData[0][column])}>
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

      if (isDesktopView) {
        const header = Object.keys(columnsToRender).map(column => (
          <th key={t(columnsToRender[column].header)} scope="col">
            {columnsToRender[column].header}
          </th>
        ));

        /* eslint-disable react/no-array-index-key */
        const rows = displayData.map((row, index) => (
          <tr key={`row-${index}`}>
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
                    <th key={`cell-${i}`} scope="row" className={columnsToRender[column].header}>
                      {year || 'N/A'}
                    </th>
                  );
                }
                return (
                  <td key={`cell-${i}`} className={style}>{row[column] || 'N/A'}</td>
                );
              })
            }

          </tr>
        ));
        /* eslint-enable react/no-array-index-key */

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
          <table styleName="data-table" summary={summary}>
            <caption>
              {caption}
              <div styleName="visually-hidden">
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
      } else {
        /* eslint-disable react/no-array-index-key */
        const rows = displayData.map((row, index) => (
          <div key={`row-${index}`} styleName="cell">
            {
              Object.keys(columnsToRender).map((column, i) => {
                if (columnsToRender[column].th) {
                  let year = '';
                  if (columnsToRender[column].header === 'Year' && +row.year !== +row.yearend) {
                    year = `${row[column]} - ${row.yearend}`;
                  } else {
                    year = `${row[column]}`;
                  }
                  return (
                    <div key={`cell-${i}`}>
                      {columnsToRender[column].header}: {year || 'N/A'}
                    </div>
                  );
                }
                return (
                  <div key={`cell-${i}`}>
                    {columnsToRender[column].header}: {row[column] || 'N/A'}
                  </div>
                );
              })
            }
          </div>
        ));
        /* eslint-enable react/no-array-index-key */

        table = (
          <div styleName="mobile-view">
            <div styleName="title">{caption}</div>
            <div styleName="visually-hidden">{additionalCaption}</div>
            {rows}
          </div>
        );
      }
    }

    let hiddenTable;
    if (!this.state.isModalOpen) {
      hiddenTable = (
        <div styleName="visually-hidden">
          {table}
        </div>
      );
    }

    return (
      <div styleName="link-container">
        <button
          href="#"
          styleName="open-table"
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
          <div
            style={{
              textAlign: 'right'
            }}
          >
            <button styleName="close-table" onClick={this.closeModal}>
              <span className="fa fa-close" />
            </button>
          </div>
          <div
            style={{
              overflow: 'auto',
              maxHeight: '74vh',
              margin: '10px 0'
            }}
          >
            {table}
          </div>
          <button styleName="close-table" onClick={this.closeModal}>Close</button>
        </Modal>
      </div>
    );
  }
}

DataTable.propTypes = {
  // props
  isForMap: PropTypes.bool,
  latestYear: PropTypes.number,
  rawData: PropTypes.arrayOf(PropTypes.shape({
    data_value: PropTypes.number,
    data_value_type: PropTypes.string,
    data_value_unit: PropTypes.string,
    high_confidence_limit: PropTypes.number,
    low_confidence_limit: PropTypes.number,
    year: PropTypes.number
  })).isRequired,
  showOnlyLatest: PropTypes.bool,
  // Redux state
  isDesktopView: PropTypes.bool.isRequired
};

DataTable.defaultProps = {
  isForMap: false,
  latestYear: undefined,
  showOnlyLatest: false
};

const mapStateToProps = state => ({
  isDesktopView: _get(state, 'appConfig.isDesktopView')
});

export default connect(mapStateToProps)(cssModules(DataTable, styles));
