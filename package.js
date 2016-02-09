Package.describe({
  name: 'one-time-pass',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'MFA solution with One Time PassCode, compatible with google authenticator',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2.2');
  api.addFiles('one-time-passcode-common.js');
  api.addFiles('one-time-passcode-client.js', 'client');
  api.addFiles('one-time-passcode-server.js', 'server');
  // api.use('jeeeyul:moment-with-langs@2.8.2');
  api.export('MeteorOTP');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('branche:one-time-pass');
  api.addFiles('one-time-passcode-tests.js');
});

Npm.depends({"speakeasy": "https://github.com/markbao/speakeasy/tarball/d9525fdde341624109557da52ad6cdd270025059"});
