var mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://li21-127.members.linode.com/errrecorderdb');

mongoose.model('Error', {
    properties: [
        '_id', 'group-id',
        'msg', 'time', 'type'
    ],

    //methods: {
    //    save: function (fn) {
    //        this.created_at = new Date();
    //        this.__super__(fn);
    //    }
    //}
});

module.exports = db.model('Error');
