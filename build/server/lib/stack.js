// Generated by CoffeeScript 1.7.1
var Client, addDatabase, addInDatabase, config, controllerAdded, fs, log, path, permission;

fs = require('fs');

path = require('path');

Client = require('request-json-light').JsonClient;

log = require('printit')();

config = require('./conf').get;

permission = require('../middlewares/token');

controllerAdded = false;

addDatabase = function(test, app) {
  if (test > 0) {
    return addInDatabase(app, function(err) {
      if (app.name === 'data-system' && (err != null)) {
        return setTimeout(function() {
          return addDatabase(test - 1, app);
        }, 1000);
      }
    });
  }
};

addInDatabase = function(app, callback) {
  var clientDS;
  clientDS = new Client("http://localhost:9101");
  clientDS.setBasicAuth('home', permission.get());
  return clientDS.post('/request/stackapplication/all/', {}, function(err, res, body) {
    var appli, application, _i, _len;
    application = null;
    if (err == null) {
      for (_i = 0, _len = body.length; _i < _len; _i++) {
        appli = body[_i];
        appli = appli.value;
        if (appli.name === app.name) {
          application = appli;
        }
      }
    }
    if (application !== null) {
      app.lastVersion = application.lastVersion;
      return clientDS.put("/data/" + application._id + "/ ", app, function(err, res, body) {
        if (err != null) {
          log.warn("Error in updating " + app.name + " to database");
          log.warn(err);
        } else {
          if (app.name === 'controller') {
            controllerAdded = true;
          }
        }
        return callback(err);
      });
    } else {
      return clientDS.post('/data/', app, function(err, res, body) {
        if ((err == null) && ((body != null ? body.error : void 0) != null)) {
          err = body.error;
        }
        if (err != null) {
          log.warn("Error in adding " + app.name + " to database");
          log.warn(err);
        } else {
          if (app.name === 'controller') {
            controllerAdded = true;
          }
        }
        return callback(err);
      });
    }
  });
};


/*
    Add application <app> in stack.json
        * read stack file
        * parse date (in json)
        * add application <app>
        * write stack file with new stack applications
 */

module.exports.addApp = function(app, callback) {
  var appli, data;
  fs.readFile(config('file_stack'), 'utf8', function(err, data) {
    try {
      data = JSON.parse(data);
    } catch (_error) {
      data = {};
    }
    data[app.name] = app;
    return fs.open(config('file_stack'), 'w', function(err, fd) {
      return fs.write(fd, JSON.stringify(data), 0, data.length, 0, callback);
    });
  });
  data = require(path.join(config('dir_source'), app.name, 'package.json'));
  appli = {
    name: app.name,
    version: data.version,
    git: app.repository.url,
    docType: "StackApplication"
  };
  return addDatabase(5, appli, (function(_this) {
    return function(err) {
      var controller, controllerPath;
      if (!controllerAdded) {
        controllerPath = path.join(__dirname, '..', '..', '..', 'package.json');
        if (fs.existsSync(controllerPath)) {
          data = require(controllerPath);
          controller = {
            docType: "StackApplication",
            name: "controller",
            version: data.version,
            git: "https://github.com/cozy/cozy-controller.git"
          };
          return addInDatabase(controller);
        }
      }
    };
  })(this));
};


/*
    Remove application <name> from stack.json
        * read stack file
        * parse date (in json)
        * remove application <name>
        * write stack file with new stack applications
 */

module.exports.removeApp = function(name, callback) {
  return fs.readFile(config('file_stack'), 'utf8', function(err, data) {
    try {
      data = JSON.parse(data);
    } catch (_error) {
      data = {};
    }
    delete data[name];
    return fs.open(config('file_stack'), 'w', function(err, fd) {
      return fs.write(fd, JSON.stringify(data), 0, data.length, 0, callback);
    });
  });
};
