// subscribe
Meteor.subscribe("OTP");

if (typeof MeteorOTP === "undefined")
  MeteorOTP = {};

/**
 * Call a callback if OTP is ok
 * callAfterOTPCheck(yourFunction, arg1, arg2, ...)
 *
 * /!\ if called client side, be aware that this is easy to bypass.
 *
 * You need to call it client side for best user XP
 * AND made an other OTP check server side for security concerning critical actions
 */
MeteorOTP.callAfterOTPCheck = function (callback) {
  try {
    if (MeteorOTP.checkOTPExpiration(Meteor.user())) {
      Meteor.call('checkOTP', prompt("Type your OTP"), function (err, res) {
        if (res) // only set a result if OTP is ok
          callback(null, res);
        else
          callback(Meteor.Error(401, "OneTimePassCode error: OTP incorrect !"));
      });
      return;
    }
  } catch (err) {
    callback(new Meteor.Error(501, "OneTimePassCode error: you don't have OTP activated on your user account"));
  }
  // run the callback: OTP is not expired
  callback(null, true);
}