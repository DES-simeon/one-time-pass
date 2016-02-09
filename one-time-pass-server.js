// Publish
Meteor.publish("OTP", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
      {fields: {'OTP.activated': 1, 'OTP.lastCheckDate': 1}}
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
    var key = speakeasy.generate_key( {length : 32} );
    var key32 = key.base32
    var token = speakeasy.totp({
		  secret: key32,
		  encoding: 'base32'
		});
		
    console.log("-------token---------");
    console.log(token);
    var otpURL = "otpauth://totp/branche.des.com:" + Meteor.user().profile.phone + "?secret=" + key.base32 + "&issuer=branche.des.com";
    Meteor.users.update(this.userId, {$set: {'OTPTmp': {key: key, token: token, lastUsedCodes: [], activated: true}, 'OTPUrl': otpURL }});
    return token;
  },
  activeOTP: function () {
    if (!this.userId)
      throw new Meteor.Error(403, "Can only be called by a connected user.");
    var currentUser = Meteor.users.findOne(this.userId, {fields: {'OTPurlTmp': 1}});
    currentUser.onePassCodeTmp.lastCheckDate = moment().toDate();
    Meteor.users.update(this.userId, {$set: {'OTP': currentUser.tokenTmp}, $unset: {'OTPTmp': ""}});
  },
  cancelInitOTP: function () {
    Meteor.users.update(this.userId, {$unset: {'OTPTmp': ""}});
  },
  checkOTP: function (code, tmp) {
    if (!this.userId) {
      return new Meteor.Error(403, "Can only be called by a connected user.");
    }
    var profileOTP = null;
    if (tmp) {
      profileOTP = Meteor.users.findOne(this.userId, {fields: {'OTPTmp': 1}}).OTPTmp;
    }
    else {
      profileOTP = Meteor.users.findOne(this.userId, {fields: {'OTP': 1}}).OTP;
    }
    console.log("-----profileOTP-----");
    console.log(profileOTP);
    console.log("-----code-----");
    console.log(code);
    console.log("-----PRE DELTA-----");
    var tokenDelta = speakeasy.totp.verify({
		  secret: profileOTP.key.base32,
		  encoding: 'base32',
		  token: code,
		  window: 6
		});
    // If user has just validate an OTP, set the last check date to now!
    if (tokenDelta && !tmp) {
      Meteor.users.update(this.userId, {$set: {'OTP.lastCheckDate': new Date()}});
    }
    console.log("-----DELTA-----");
    console.log(tokenDelta);
    return tokenDelta;
  }
});
