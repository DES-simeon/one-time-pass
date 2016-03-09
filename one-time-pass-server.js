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
    TOTP.remove({'uuid': this.userId});
    var key = speakeasy.generateSecret( {length : 32} );
    var key32 = key.base32
    var token_val = speakeasy.totp({
      secret: key32,
      encoding: 'base32'
    });
    var otpURL = "otpauth://totp/branche.des.com:" + Meteor.user().profile.phone + "?secret=" + key.base32 + "&issuer=branche.des.com";
    
    console.log("Generated TOTP");
    console.log(token_val);

    TOTP.insert({
      uuid: Meteor.userId(),
      secret: key32,
      val: token_val,
      encoding: 'base32',
      url: otpURL,
      lastCheckDate: new Date()
    });
    console.log("Done with TOTP");

    return token_val;
  },
  cancelOTP: function () {
    TOTP.remove({'uuid': this.userId});
  },
  checkOTP: function (code, tmp) {
    if (!this.userId) {
      return new Meteor.Error(403, "Can only be called by a connected user.");
    }
    console.log("Confirming TOTP");
    var profileOTP = TOTP.findOne({'uuid': this.userId});
    console.log(profileOTP);
    
    var tokenDelta = speakeasy.totp.verify({
      secret: profileOTP.secret,
      encoding: 'base32',
      token: code,
      window: 4
    });
    console.log(tokenDelta);
    // If user has just validate an OTP, set the last check date to now!
    if (tokenDelta) {
      TOTP.remove({'uuid': this.userId});
    } 
    return tokenDelta;
  }
});
