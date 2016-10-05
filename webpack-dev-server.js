// var yaml = require("js-yaml");
// var fs = require("fs");
// var pathExtra = require("path-extra");

var config = require("./webpack.config.js");
config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");

// var hostname = "chronicdata.cdc.gov";
// var socrataCredentials;
// var socrataUsername;
// var socrataPassword;
// try {
//   socrataCredentials = yaml.safeLoad(fs.readFileSync(`${pathExtra.homedir()}/.soda.yml`));
//   socrataUsername = socrataCredentials.username;
//   socrataPassword = socrataCredentials.password;
// } catch (e) {
//   console.log(`Unable to find your Socrata Credentials at ~/.soda.yml at ${pathExtra.homedir()}`);
// }

// var defaultProxySetting = {
//   target: `https://${hostname}`,
//   host: hostname,
//   changeOrigin: true,
//   secure: false,
//   auth: `${socrataUsername}:${socrataPassword}`
// };

// config.devServer = {
//   proxy: {
//     '/api/assets/*': defaultProxySetting,
//     '/webfonts/*': defaultProxySetting,
//     '/views/*': defaultProxySetting,
//     '/resource/*': defaultProxySetting
//   }
// };

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {...});
server.listen(8080);
