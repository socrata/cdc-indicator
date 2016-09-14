/**
 * Soda - javascript library for making SODA requests in ES2015 projects
 *
 * Example:
 * new Soda(configObject)
 *   .dataset('abcd-1234')
 *   .where(queryObject)
 *   .fetchData()
 *   .then((data) => {
 *     // do something with data
 *   });
 */

import querystring from 'querystring';

/* * * helper functions * * */

/**
 * Checks whether a variable is of the specified type
 * @param {String} type - type to check for, e.g., 'String', 'Number', etc.
 * @param {Object} obj - variable to check
 * @return {Boolean} - is variable of expected type?
 */
function is(type, obj) {
  // get the [Class] property, then strip off the beginning "[object " and ending "]"
  const className = Object.prototype.toString.call(obj).slice(8, -1);
  return obj !== undefined && obj !== null && className === type;
}

/**
 * Flattens a potentially multidimentional array
 * @param {Array} array - array to flatten
 * @return {Array} - flattened array
 */
function flatten(array) {
  return [].concat.apply([], array);
}

/**
 * Format value in single quotes if string
 * @param {*} literal - literal to check
 * @return {Number|String} - formatted value for SoQL
 */
const formatLiteral = function (literal) {
  if (is('String', literal)) {
    // escape single quote, then wrap in single quotes
    return `'${literal.replace(/'/g, "''")}'`; // eslint-disable-line quotes
  } else if (is('Number', literal)) {
    return literal.toString();
  }

  return literal;
};

/**
 * Determine if passed element is null or empty (mostly used as callback to Array.filter())
 * @param {*} element - an array element
 * @return {Boolean} - is this element null or empty?
 */
const filterEmptyValues = function (element) {
  return element !== undefined && element !== null && element !== '';
};

/**
 * Parse _where and _having object into a query string
 * @param {Array} conditions - array of conditions
 * @param {String} operator - 'AND' | 'OR'
 * @return {String} - properly formatted order string
 */
const parseQueryObject = function (conditions, operator) {
  return conditions.map((element) => {
    // string is assumed to be a valid where condition string
    if (is('String', element)) {
      return element;
    }

    // recursively parse conditions if we have AND or OR condition
    if (conditions.condition && is('Array', conditions.condition)) {
      // enclose in parenthesis
      return `(${parseQueryObject(conditions.condition, conditions.operator)})`;
    }

    // TODO handle 'NOT'
    // TODO handle IN, NOT IN

    switch (conditions.operator.toUpperCase()) {
      case 'STARTS_WITH':
        return `STARTS_WITH(${conditions.column}, ${formatLiteral(conditions.value)})`;
      case 'IS NULL':
      case 'IS NOT NULL':
        return `${conditions.column} ${conditions.operator}`;
      default:
        return `${conditions.column} ${conditions.operator} ${formatLiteral(conditions.value)}`;
    }
  }).join(` ${operator} `);
};

/**
 * Helper to format _where and _having object from user input
 * @param {Array} element - columns parameter
 * @return {Object} - properly formatted where or having object
 */
const formatQueryObject = function (element) {
  // conditions were specified as an array or multiple parameters
  if (element.length > 1) {
    return {
      operator: 'AND',
      condition: element
    };
  } else if (element.length === 1) {
    if (is('String', element[0])) {
      // a single string specify 1 or more conditions
      return {
        operator: 'AND',
        condition: [element[0]]
      };
    } else if (element[0].value) {
      // a single object specify 1 query condition
      return {
        operator: 'AND',
        condition: [element[0]]
      };
    } else if (is('Array', element[0].condition) && is('String', element[0].operator)) {
      // looks like an already properly formatted object
      return element[0];
    }
  }

  // return empty object if something unexpected was received
  return {};
};

/**
 * Parse .order() input into expected format
 * - It accepts either a String (returned as is), or an Object with the following keys:
 *   {
 *     column: 'column_name',
 *     order: {'DESC'|'ASC'|'DESC NULL LAST'} - not validated
 *   }
 * @param {String|Object} element - order element
 * @return {String} - properly formatted order string
 */
const parseOrder = function (element) {
  // return as is if it is a string (expected to be correct)
  if (is('String', element)) {
    return element;
  }

  // if it is an object and has a key named "column", stringify it
  if (element.column !== undefined) {
    if (is('String', element.column)) {
      let order = '';
      if (element.order !== undefined && is('String', element.order)) {
        order = ` ${element.order.toUpperCase()}`;
      }
      return `${element.column}${order}`;
    }
  }

  // return null if not properly formatted
  return null;
};

export default class Soda {

  /**
   * Constructor
   * Parameters are expected to be passed as an object, all are optional:
   * {
   *   appToken: [string]   // Socrata app token used with your request
   *                        // not required but recommended
   *   hostname: [string]   // Site name to query against
   *                        // Leave this parameter out to issue requests using relative URLs
   *   useSecure: [boolean] // whether request should use https (true, default) or http (false)
   *                        // Only used if hostname is set
   *   username: [string]   // Username used to authenticate your request [CURRENTLY UNSUPPORTED]
   *   password: [string]   // Password used to authenticate your request [CURRENTLY UNSUPPORTED]
   * }
   *
   * !!! Do NOT use username and password in front-end application !!!
   *
   * @param {Object} config
   */
  constructor(config) {
    // make configuration parameters available to this instance
    this._config = Object.assign({}, config);

    // initialize query conditions
    // $q parameter currently not supported, other than using it with .soql()
    this._dataset = null;   // dataset ID or API endpoint to request
    this._format = 'json';  // set default data format to JSON
    this._select = [];      // array of columns to select
    this._where = {};       // object of columns to query by
    this._having = {};      // object defining result conditions to filter by
    this._group = [];       // array of columns to group by
    this._order = [];       // array of columns and directions to order by
    this._limit = 1000;     // number of rows to retrieve
    this._offset = 0;       // number of records to offset the starting position by
    this._query = null;     // single parameter SoQL query
    this._soql = null;      // direct SoQL input, overrides other conditions
    this._react = null;     // React component to set states
  }

  /**
   * Sets dataset ID to query
   * @param {String} id - dataset ID to query
   * @return {Soda} - for chaining
   */
  dataset(id = null) {
    this._dataset = id;
    return this;
  }

  /**
   * Sets format of data retrieved
   * @param {'json'|'csv'|'geojson'} format to receive data in
   * @return {Soda} - for chaining
   */
  format(format = 'json') {
    if (format !== 'json' && format !== 'csv' && format !== 'geojson') {
      throw new Error('Only JSON, CSV and GeoJSON output formats are supported by SODA 2.1.');
    }

    this._format = format;
    return this;
  }

  /**
   * Sets (does not append to) columns to query for ($select parameter)
   * - Subsequent .select() call will overwrite previously set values
   *
   * Examples:
   *   select('column1', 'column2', 'column3')
   *   select(['column1', 'column2', 'column3'])
   *   select('column1, column2, column3')
   *   select('COUNT(column1) AS cnt')
   *
   * @param {String|Array} columns - a series of string arguments or an array of strings
   * @return {Soda} - for chaining
   */
  select(...columns) {
    this._select = flatten(columns).filter(filterEmptyValues);
    return this;
  }

  /**
   * Sets (does not append to) columns to group by ($group parameter)
   * See examples for select() for syntax.
   *
   * @param {String|Array} columns - a series of string arguments or an array of strings
   * @return {Soda} - for chaining
   */
  group(...columns) {
    this._group = flatten(columns).filter(filterEmptyValues);
    return this;
  }

  /**
   * Sets (does not append to) columns to query by ($where parameter)
   * - if delimiting operator is not specified, 'AND' is assumed
   *
   * Examples:
   *   - when specifying conditions as string, make sure to enclose string literal in single quotes
   *   where("last_name = 'Smith' AND first_name = 'John'")
   *   where(["last_name = 'Smith'", "UPPER(first_name) LIKE '%J%'"])
   *
   *   where({
   *     column: 'last_name',
   *     operator: '=',
   *     value: 'Smith' // Note that this string does not need to be enclosed in single quotes
   *   }, {
   *     operator: 'OR',
   *     condition: [ {
   *       column: 'UPPER(first_name)',
   *       operator: 'LIKE',
   *       value: '%JOHN%'
   *     }, {
   *       column: 'first_name',
   *       operator: '=',
   *       value: 'Jon'
   *     } ]
   *   })
   *   Result: last_name = 'Smith' AND (UPPER(first_name) LIKE '%JOHN%' OR first_name = 'Jon')
   *
   * @param {String|Array|Object} columns - a series of string arguments or an array of strings
   * @return {Soda} - for chaining
   */
  where(...columns) {
    this._where = formatQueryObject(flatten(columns));
    return this;
  }

  /**
   * Sets (does not append to) columns to filter based on result by ($having parameter)
   * See examples for where() for syntax.
   *
   * @param {String|Array|Object} columns - a series of string arguments or an array of strings
   * @return {Soda} - for chaining
   */
  having(...columns) {
    this._having = formatQueryObject(flatten(columns));
    return this;
  }

  /**
   * Sets (does not append to) columns to order by ($order parameter)
   * - SODA 2.1 assumes "ASC" order when only column is specified
   * - Currently, only "NULL LAST" (_NOT_ NULLS) modifier is supported (not NULLS FIRST)
   *   and only makes sense when column is sorted in DESC order
   *
   * Examples:
   *   order('last_name', 'first_name', 'submitted_date DESC NULL LAST')
   *   order(['last_name', 'first_name'])
   *   order('updated_date DESC')
   *   order({
   *     column: 'updated_date',
   *     order: 'ASC'
   *   }, {
   *     column: 'amount',
   *     order: 'DESC NULL LAST'
   *   })
   *
   * @param {String|Array|Object} columns - a series of string arguments or an array of strings
   * @return {Soda} - for chaining
   */
  order(...columns) {
    this._order = flatten(columns).map(parseOrder).filter(filterEmptyValues);
    return this;
  }

  /**
   * Sets the number of rows to retrieve ($limit parameter)
   * @param {Number} limit - number of rows to retrieve
   * @return {Soda} - for chaining
   */
  limit(limit = 1000) {
    // ensure limit is set to an integer
    if (is('Number', limit)) {
      this._limit = Math.floor(limit);
    }
    return this;
  }

  /**
   * Sets record offset of the returned result ($offset parameter)
   * @param {Number} offset - number of rows to offset by
   * @return {Soda} - for chaining
  **/
  offset(offset = 0) {
    // ensure this is an integer
    if (is('Number', offset)) {
      this._offset = Math.floor(offset);
    }
    return this;
  }

  /**
   * Sets single parameter SoQL query ($query parameter)
   * Example:
   *   query('SELECT location, magnitude WHERE magnitude > 4.2')
   * @param {String} query - SoQL query string, not validated
   * @return {Soda} - for chaining
   */
  query(query = null) {
    this._query = query;
    return this;
  }

  /**
   * Sets SoQL query string directly, ignores other parameters
   * Example:
   *   soql('$select=location,magnitude&$where=magnitude>4.2')
   * @param {String} query - SoQL query string, not validated
   * @return {Soda} - for chaining
   */
  soql(query = null) {
    this._soql = query;
    return this;
  }

  /**
   * Sets a React component to modify its state
   * @param {React Component} component - React component
   * @return {Soda} - for chaining
   */
  react(component = null) {
    this._react = component;
    return this;
  }

  /**
   * Execute query and make AJAX request
   * @return {Promise} - for chaining and working with data
   */
  fetchData() {
    // ensure query endpoint is set
    if (this._dataset === null) {
      throw new Error('Dataset ID is not defined.');
    }

    // set up fetch header
    // TODO: add auth
    const headers = {
      'X-App-Token': this._config.appToken
    };

    // query string
    let request;

    if (this._soql !== null) {
      // if direct SoQL input is set, use it and ignore other query parameters
      request = this._soql;
    } else if (this._query !== null) {
      // if a single SoQL $query parameter is set, use that, ignoring everything else
      request = querystring.stringify({ $query: this._query });
    } else {
      // build query object using set parameters
      request = querystring.stringify(this._buildQuery());
    }

    return fetch(`${this._generateUrl()}?${request}`, { headers })
      .then(this._checkStatus)
      .then((response) => {
        // parse and return object if json was specified
        if (this._format === 'json') {
          return response.json();
        }

        // otherwise return result as is
        return response.text();
      })
      .catch((error) => {
        // network error
        throw error;
      });
  }

  // TODO get downloadLink()

  // TODO post(data)
  // TODO put(data)

  /* * * "private" methods * * */

  /**
   * Builds query object based on set parameters for retrieving data
   * @return {Object} - object to be passed into superagent.query()
   */
  _buildQuery() {
    const queryObject = {};

    // $select
    if (this._select.length > 0) {
      queryObject.$select = this._select.join(',');
    }

    // $where
    if (this._where.condition && this._where.condition.length > 0) {
      queryObject.$where = parseQueryObject(this._where.condition, this._where.operator);
    }

    // $having
    if (this._having.condition && this._having.condition.length > 0) {
      queryObject.$having = parseQueryObject(this._having.condition, this._having.operator);
    }

    // $order
    if (this._order.length > 0) {
      queryObject.$order = this._order.join(',');
    }

    // $group
    if (this._group.length > 0) {
      queryObject.$group = this._group.join(',');
    }

    // $limit
    if (is('Number', this._limit)) {
      queryObject.$limit = this._limit;
    }

    // $offset
    if (is('Number', this._offset) && this._offset > 0) {
      queryObject.$offset = this._offset;
    }

    return queryObject;
  }

  /**
   * Constructs relative URL, or absolute URL if hostname is set
   * @return {String} - URL of the API endpoint to request
   */
  _generateUrl() {
    // always expect to hit /resource/4x4 API endpoint for SODA 2.x requests
    let url = `/resource/${this._dataset}.${this._format}`;

   // prepend protocol and host if applicable
    if (this._config.hostname !== undefined) {
      url = `${(this._config.useSecure) ? 'https' : 'http'}://${this._config.hostname}${url}`;
    }

    return url;
  }

  /**
   * Checks HTTP response code to verify it returned expected results
   * @param {Object} response - response object from fetch()
   * @return {Object} - original response object if response code is 2xx
   */
  _checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }

}
