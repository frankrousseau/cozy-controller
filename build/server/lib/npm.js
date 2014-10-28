// Generated by CoffeeScript 1.8.0
var config, log, path, spawn;

path = require('path');

spawn = require('child_process').spawn;

log = require('printit')();

config = require('./conf').get;


/*
  Install dependencies
      * Use strict-ssl or specific npm_registry in function of configuration
      * Npm install
      * Remove npm cache
 */

module.exports.install = function(connection, target, callback) {
  var args, child, options, stderr;
  args = ['npm', '--production', '--loglevel', 'http', '--unsafe-perm', 'true', '--user', target.user];
  if (config('npm_registry')) {
    args.push('--registry');
    args.push(config('npm_registry'));
  }
  if (config('npm_strict_ssl')) {
    args.push('--strict-ssl');
    args.push(config('npm_strict_ssl'));
  }
  args.push('install');
  options = {
    cwd: target.dir
  };
  child = spawn('sudo', args, options);
  setTimeout(child.kill.bind(child, 'SIGKILL'), 10 * 60 * 1000);
  stderr = '';
  child.stderr.on('data', function(data) {
    return stderr += data;
  });
  child.stdout.on('data', function(data) {
    return connection.setTimeout(3 * 60 * 1000);
  });
  return child.on('close', function(code) {
    var err;
    if (code !== 0) {
      log.error("npm:install:err: NPM Install failed : " + stderr);
      err = new Error('NPM Install failed');
      return callback(err);
    } else {
      log.info('npm:install:success');
      return callback();
    }
  });
};
