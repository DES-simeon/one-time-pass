TOTP = new Mongo.Collection('totp');

TOTP.attachSchema(new SimpleSchema({
	'uuid': {
    type: String,
    unique: true
  },
  'secret': {
    type: String
  },
  'val': {
    type: String
  },
  'encoding': {
    type: String
  },
  'url': {
    type: String
  },
  'lastCheckDate': {
    type: Date
  }
}));

if(Meteor.isClient){
  Meteor.subscribe('totp');
};

if(Meteor.isServer){
  Meteor.publishComposite('totp', function() {
	  return {
	    collectionName:'totp',
	    find: function() {
	        return TOTP.find({});
	    },
	    children: [
	      {
	        find: function(item) {
	          return TOTP.find({_id : item._id});
	        }
	      }
	    ]
	  }
	})

  TOTP.allow({
	  'insert': function(userId, doc) {
	    return userId;
	  },
	  'update': function(userId, doc, fields, modifier) {
	    return userId;
	  },
	  'remove': function(userId, doc) {
	    return userId;
	  },
	});
};