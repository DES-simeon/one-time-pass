Package.describe({
  name: 'branche:one-time-pass',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Timed One Time PassCode, compatible with google authenticator',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/DES-simeon/one-time-pass.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('mongo');
  api.use('aldeed:simple-schema');
  api.use('reywood:publish-composite');

  api.versionsFrom('METEOR@0.9.2.2');
  api.addFiles('one-time-pass-server.js', 'server');
  api.addFiles('one-time-pass-collections.js', 'server');
  // api.use('jeeeyul:moment-with-langs@2.8.2');
  api.export('MeteorOTP');
  api.export('TOTP',['server','client']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('branche:one-time-pass');
  api.addFiles('one-time-passcode-tests.js');
});

Npm.depends({"speakeasy": "2.0.0"});
