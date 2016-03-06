/**
 * Created by Nathan on 3/5/2016.
 */

var utils = {};

utils.formatDate = function(d){
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var date = new Date(d);
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
};

utils.dateAddLeadingZero = function(n) {
    return n < 10 ? '0' + n : n;
};

utils.today = function() {
    var d = new Date();
    var day = utils.dateAddLeadingZero(d.getDate());
    var month = utils.dateAddLeadingZero(d.getMonth() + 1);
    var year = d.getFullYear();

    return year + '-' + month + '-' + day;
};


module.exports = utils;