// Generated by CoffeeScript 1.9.3
var config, fs, log, path;

path = require("path");

config = require('./conf').get;

fs = require('fs');

log = require('printit')({
  date: true
});


/*
    Usefull to translate application stored in database in manifest
 */

exports.App = (function() {
  function App(app) {
    var folderDir, homeDir, logDir, manifest, match, ref, ref1, start;
    this.app = app;
    homeDir = config('dir_app_bin');
    logDir = config('dir_app_log');
    folderDir = config('dir_app_data');
    this.app.dir = path.join(homeDir, this.app.name);
    this.app.user = 'cozy-' + this.app.name;
    match = this.app.repository.url.match(/\/([\w\-_\.]+)\.git$/);
    this.app.logFile = path.join(logDir, "/" + this.app.name + ".log");
    this.app.errFile = path.join(logDir, "/" + this.app.name + "-err.log");
    this.app.folder = path.join(folderDir, this.app.name);
    if (((ref = this.app.scripts) != null ? ref.start : void 0) != null) {
      this.app.server = this.app.scripts.start;
    } else {
      try {
        manifest = require(path.join(this.app.dir, "package.json"));
      } catch (_error) {
        if (this.app.name != null) {
          log.error(this.app.name + ": Unable to read application manifest");
        } else {
          log.error("Unable to read application manifest");
        }
      }
      if ((manifest != null ? (ref1 = manifest.scripts) != null ? ref1.start : void 0 : void 0) != null) {
        start = manifest.scripts.start.split(' ');
        this.app.server = start[start.length - 1];
      } else if (fs.existsSync(path.join(this.app.dir, 'build', 'server.js'))) {
        this.app.server = 'build/server.js';
      } else if (fs.existsSync(path.join(this.app.dir, 'server.js'))) {
        this.app.server = 'server.js';
      } else if (fs.existsSync(path.join(this.app.dir, 'server.coffee'))) {
        this.app.server = 'server.coffee';
      } else {
        log.error("Unable to find a start script");
      }
    }
    if (this.app.server != null) {
      this.app.startScript = path.join(this.app.dir, this.app.server);
    }
  }

  return App;

})();
