# Change Log

## 0.3.0

### Changed
- Specify node.js version to 14
- Resolved dependency vulnerabilities by running `npm audit fix`

## 0.2.0

### Added
- Change log
- SASS (SCSS) Loader
- Define `jsonpFunction` name in `webpack.config.js`, to reduce chances of conflicts

### Changed
- `<Grid>` now use flexbox
- Upgraded various dependencies. Notably:
  - React/ReactDOM to v16.2.0
  - Webpack to v3.10.0
- No longer import the entire `lodash` library to reduce bundle size
- Moved `layouts` components to `components`
- Included rendered components within `containers`, except for `<Filters>`,
  which is used with and without redux

### Fixed
- Various lint errors, due to bumping versions of eslint and its extensions
