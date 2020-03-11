# CDC Disease Indicator Tool

## Description

CDC Disease Indicator Tool is a data visualization tool which allows users to compare
various available indicator data by location and breakout category, build using React.js.

Though many aspects of the tool can be customized via configuraiton files or using
datasets on Socrata Publica, this tool is heavily dependent on source data structure.
API field names can be configured by a configuration file, but data must at least
contain columns for year, indicator, location, breakout category and breakout.
Please refer to the current [CDC Leading Health Indicators Data][] on
CDC Chronic Disease and Health Promotion Open Data portal.

[CDC Leading Health Indicators Data]: https://chronicdata.cdc.gov/d/77gz-wv5w

## Assumptions

None.

## Constraints

* Data query code is heavily customized to fetch data from a Socrata API Endpoint.

## Technologies Used

* [react](https://github.com/facebook/react)
* [redux](https://github.com/rackt/redux)
* [c3js](http://c3js.org/)
* [leaflet](http://leafletjs.com/)

## Getting Started

After you have cloned this project and changed your working directory,
install dependencies by running `npm install`.

Before running this tool even locally, you must copy a sample configuration file
for development and set a few parameters.

```bash
$ cp src/constants/configurations.sample.yml src/constants/configurations.development.yml
```

You'll also need versions of that file for staging and production, so create them via the same
technique:

```bash
$ cp src/constants/configurations.sample.yml src/constants/configurations.staging.yml
$ cp src/constants/configurations.sample.yml src/constants/configurations.production.yml
```

Note that those two files will need to be modified in order to build successfully for either staging
or production. Since these files are gitignore'd out of the repo intentionally, check with the
current maintainers for their copies of these files to ensure you have current credentials and
settings.

The sample configuration file contains enough settings to get you up and running,
except you must provide your own [Socrata App Token][] and [Mapbox Access Token][].
Once copied, open `configurations.development.yml` and enter your application tokens.

1. Socrata app token

```yaml
soda:
  appToken: (ENTER YOUR SOCRATA APP TOKEN)
  hostname: chronicdata.cdc.gov
  useSecure: true
```

2. Mapbox app token

```yaml
map:
  tileUrl: https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}
  tileId: mapbox/light-v10
  mapboxToken: (ENTER YOUR MAPBOX ACCESS TOKEN)
```

[Socrata App Token]: https://dev.socrata.com/docs/app-tokens.html
[Mapbox Access Token]: https://www.mapbox.com/help/define-access-token/

Once both tokens are set, running `npm start` will start `webpack-dev-server` and
you should be able to access this tool by navigating your browser to
`http://localhost:8080/cdc-indicator`.

## Application Structure

```
.
├── build                       # target directory for webpack build
├── dev                         # static files needed for running this tool locally
├── src                         # application source code
│   ├── components              # reusable components
│   ├── constants               # static data, such as configurations
│   ├── containers              # container components, connected to Redux store
│   ├── lib                     # custom helper libraries
│   ├── modules                 # redux store modules, includes constants, actions and reducers
│   ├── reducers                # collection of reducers from all modules
│   ├── styles                  # CSS files, processed by CSS Modules, imported by components
│   ├── index.css               # CSS that is not processed by CSS Modules
│   ├── index.template.html     # HTML container
│   └── main.jsx                # main application bootstrap
├── webpack-dev-server.js       # additional configuration for running webpack-dev-server
└── webpack.config.js           # webpack configuration for "build" process
```

## Development

[Redux DevTools][] extension for Chrome is enabled when running this tool locally.

[Redux DevTools]: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

## Configuring Display

In addition to core application settings that is specified in `configurations.development.yml` file,
this tool is designed to work with Socrata datasets to get title, label and other textual data.
During development, you can set `useConfigurationDatasets` to `false` to read these parameters
from a local YAML file, `userConfigurableOptions.yml`.

### Core

Expects an array of objects, with a single row.

| Field Name | Description | Type | Example |
| ---------- | ----------- | ---- | ------- |
| `title` | Small amount of text to be used as the “title” that appears over the entire application. Can be left blank, if desired. | Text String | “CDC Indicator Explorer” [blank] |
| `intro` | Small amount of text to be used as an introduction to the tool or to provide additional context.  Can be left blank, if desired. | Text String | “Welcome to the CDC Indicator Explorer.  Please select an indicator and any breakouts to begin exploring!” |
| `filter_intro` | Small amount of text to be used as further introduction to the filters of the tool.  Can be left blank, if desired. | Text String | “The below indicators include the ability to filter by states and breakout categories” |
| `data_points` | The number of datapoints, across the entire application, that will be displayed for a trendline (e.g., set “5” to show the latest 5 years worth of data) | Number | 10 |
| `footnote` | A small amount of text, to appear as a footnote to the application; the text will remain static no matter which indicator is selected.  Can be left blank, if desired. | Text String | “Questions about the indicator can be routed to questions@cdc.gov” |
| `source_data_label` | Small amount of text used as label heading when displaying Source Data links at the bottom of the tool. | Text String | "Source Data:" |
| `source_system_label` | Small amount of text used as label heading when displaying Source System links at the bottom of the tool. | Text String | "Source System:" |

### Filter

Expects an array of objects, where objects have the following structure.


| Field Name | Description | Type | Example |
| ---------- | ----------- | ---- | ------- |
| `sort` | The order of the appearance for the filter.  From left to right, appears as “1”, “2” or “3” | Number | 1 |
| `label` | Small amount of text that can be used as context to the filter | Text String | “Select an indicator” |
| `label_column` | The value that is displayed for each entry in the dropdown (note: Differs from the “Value Column” as this is the “human readable” version of the data) | Text (field name) | question |
| `value_column` | Sets the actual values in which to allow the tool to filter by; may be different than the above | Text (field name) | questionid |
| `group_by` | Optional field - allows the dropdown to be “grouped” by a value - that is, to be broken down to be more readable.  Recommended is breaking indicator into “topic” in case there are multiple indicators for a given topic | Text (field name) | topic |
| `group_by_id` | Optional field - value that is displayed for each entry in the `group_by` | Text (field name) | topicid |
| `default_value` | Allows the administrator to set a “default Value”, that loads when the page is first loaded.  This is the value to adjust if you want to configure which indicator loads as the first. | Text (Value from “Value column”) | PHY001 |

Note that there must be at least 3 filters defined, where `value_column` and `label_column`
match values in `configurations.development.yml` for the following key pairs:
`indicatorId` and `indicatorLabel`; `locationId` and `locationLabel`;
`breakoutCategoryId` and `breakoutCategoryLabel`.

It is recommended that order of the filters are: indicator, location and breakout category.
This is because whenever indicator value changes, selectable values of location and
breakout category are updated based on selection. When location value changes,
selectable values of breakout category are updated.

### Chart

Expects an array of objects, where objects have the following structure.
Each configured indicator (using ID value) or 'default' can have up to 3 charts configured.

| Field Name | Description | Type | Example |
| ---------- | ----------- | ---- | ------- |
| `indicator` | Using the “QuestionID” value within the dataset, designates which indicator the visualization that is on that line applies to. NOTE: Users can set this to “default”.  The “default” indicator set allows CDC to set a combination of visualizations that will appear for any indicators that do not have additional settings explicitly set.  For example, if it is decided that 5 indicators should all simply be a Trend Chart, setting the “default” to only having a Trend Chart may be the simplest option | Text (Value from “Value column”) or "default" | PHY001 |
| `sort` | The order of the appearance for the visualization.  From left to right, appears as “1”, “2” or “3”, depending on the number of visualizations | Number | 1 |
| `type` | The type of the visualization that will be displayed. Must be one of the following values (case sensitive): line bar column pie map | Text String | bar |
| `data` | Designates to the tool whether this visualization should be a “trend” (using multiple years) or a “latest” (using a single year of the latest available data) If the visualization is a trendline, enter “trend” If the visualization is a map, leave this blank If the visualization is any other type, enter “latest” | Text String | latest |
| `title` | Brief title text that appears above each visualization. | Text String | “Trend Across the U.S.” |
| `footnote` | Configurable footnote/text that appears underneath each visualization to provide context or additional information | Text String | “Smoking rates have decreased nationwide since 2010, but remains high in Southern states such as Alabama” |
| `published` | Binary checkbox that allows the user to hide/display visualizations easily.  This can be used to configure visualizations, and hide them without having to delete them should you want to add additional visualizations. | Boolean | true |

### Data Sources

Expects an array of objects, where objects have the following structure.

| Field Name | Description | Type | Example |
| ---------- | ----------- | ---- | ------- |
| `questionid` | The “questionid” value for an indicator; allows the application to know which indicator the information is applied to.  One line per indicator | Text String | AL002 |
| `source_label` | The text name of the source of the data for this indicator.  For example, if this indicator’s data came from the BRFSS system, this will be “BRFSS” | Text String | BRFSS |
| `source_link` | Link to the website or other link to provide additional information on the source.  For example, if this indicator’s data came from the BRFSS system, this may be “cdc.gov/brfss” | URL | http://www.cdc.gov/brfss |
| `data_label` | Text name of the dataset or data category that the data is a part of.  For example, if an indicator’s data is from the HRQOL subset of BRFSS data, this would be “HRQOL” | Text String | HRQOL |
| `data_link` | Link to the source dataset or other link to provide users with access to the full dataset (I.e., not the abbreviated dataset powering the app) | URL | https:///www.socrata.com/ |

## Testing

TBD

## Building

You will need to create `configurations.production.yml` file with parameters to be used
on production site.

Running `npm run build` will start webpack process, which will output HTML, CSS and JS files
under `build` directory.

### Building into Socrata

You will need to upload `build/app.js` to asset service, and update the asset ID over on
`chronicdata.cdc.gov` repository. If there are CSS changes, copy `build/_app.css` into
`css` directory in `chronicdata.cdc.gov` repository.

### Deploying to gh-pages

Running `npm run deploy` uses [gh-pages][] to deploy contents of `build` directory
to `gh-pages` branch.

[gh-pages]: https://github.com/tschaub/gh-pages

## Known Issues

- HMR will reload the entire page when changes are made to a component.

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
