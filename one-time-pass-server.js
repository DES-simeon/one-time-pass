// Publish
Meteor.publish("OTP", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
      {fields: {'onePassCode.activated': 1, 'onePassCode.lastCheckDate': 1}}
  	);
  } else {
    this.ready();
  }
});

// speakeasy is a OTP generator that already has built-in functionality for Gogle authenticator
var speakeasy = Npm.require('speakeasy');

Meteor.methods({
  initOTP: function () {
    if (!this.userId)
      throw new Meteor.Error(403, "Can only be called by a connected user.");
    var key = speakeasy.generate_key( {length : 20} );
    var otpURL = "otpauth://totp/branche.des.com:" + Meteor.user().emails[0].address + "?secret=" + key.base32 + "&issuer=marvin.morea.fr";
    console.log(key.base32);
    Meteor.users.update(this.userId, {$set: {'onePassCodeTmp': {key: key, lastUsedCodes: [], activated: true}}});
    return otpURL;
  },
  activeOTP: function () {
    if (!this.userId)
      throw new Meteor.Error(403, "Can only be called by a connected user.");
    var currentUser = Meteor.users.findOne(this.userId, {fields: {'onePassCodeTmp': 1}});
    currentUser.onePassCodeTmp.lastCheckDate = moment("2000-01-01").toDate();
    Meteor.users.update(this.userId, {$set: {'onePassCode': currentUser.onePassCodeTmp}, $unset: {'onePassCodeTmp': ""}});
  },
  cancelInitOTP: function () {
    Meteor.users.update(this.userId, {$unset: {'onePassCodeTmp': ""}});
  },
  checkOTP: function (code, tmp) {
    if (!this.userId)
      return new Meteor.Error(403, "Can only be called by a connected user.");
    var profileOTP = null;
    if (tmp)
      profileOTP = Meteor.users.findOne(this.userId, {fields: {'onePassCodeTmp': 1}}).onePassCodeTmp;
    else
      profileOTP = Meteor.users.findOne(this.userId, {fields: {'onePassCode': 1}}).onePassCode;
    var result =  (code === speakeasy.totp({key: profileOTP.key.base32, encoding: 'base32'}));
    // If user has just validate an OTP, set the last check date to now!
    if (result && !tmp)
      Meteor.users.update(this.userId, {$set: {'onePassCode.lastCheckDate': new Date()}});
    return result;
  }
});
