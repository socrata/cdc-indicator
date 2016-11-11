import _ from 'lodash';

function convertToNumber(str) {
  if (isNaN(parseFloat(str))) {
    return undefined;
  }

  return _.toNumber(str);

  // use split to determine desired precision from original data
  // const parts = str.split('.', 2);
  // let precision = 0;

  // if (parts.length > 1) {
  //   precision = parts[1].length;
  // }

  // return _.chain(str)
  //   .toNumber()
  //   .round(precision)
  //   .value();
}

export default function rowFormatter(row) {
  const convertToNumberColumns = [
    'data_value',
    'data_value_alt',
    'high_confidence_limit',
    'low_confidence_limit',
    'year'
  ];

  const newValues = convertToNumberColumns.reduce((acc, key) => {
    return Object.assign({}, acc, {
      [key]: convertToNumber(row[key] || undefined)
    });
  }, {});

  return Object.assign({}, row, newValues);
}
