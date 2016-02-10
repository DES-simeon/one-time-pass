if (typeof MeteorOTP === "undefined")
  MeteorOTP = {};

MeteorOTP.checkOTPExpiration = function (user) {
  var delay = 2; // minutes
  try {
    delay = Meteor.settings.public.OTP.expiration;
  } catch (e) {
    console.log("No Application config for OTP expiration delay, using default: 10 minutes");
  }
  return moment(user.OTP.lastCheckDate).add(delay, 'm').isBefore(moment());
}