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

Before running this tool even locally, you must copy a sample configuraiton file
for development and set a few parameters.

```bash
$ cp src/constants/configurations.sample.yml src/constants/configurations.development.yml
```

Sample configuraiton file contains enough settings to get you up and running,
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
  tileUrl: https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png
  tileId: mapbox.light
  mapboxToken: (ENTER YOUR MAPBOX ACCESS TOKEN)
```

[Socrata App Token]: https://dev.socrata.com/docs/app-tokens.html
[Mapbox Access Token]: https://www.mapbox.com/help/define-access-token/

Once both tokens are set, running `npm start` will start `webpack-dev-server` and
you should be able to access this tool by navigating your browser to `http://localhost:8080`.

## Application Structure

```
.
├── build                       # target directory for webpack build
├── dev                         # static files needed for running this tool locally
├── src                         # application source code
│   ├── components              # reusable components
│   ├── constants               # static data, such as configurations
│   ├── containers              # container components
│   ├── layouts                 # layout components for major structures
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

## Known Issues

- HMR will reload the entire page when changes are made to a component.

## License

MIT
