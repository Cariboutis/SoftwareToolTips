/**
 * Created by Alec on 2/9/2016.
 *
 * Handles validating the New Product form
 */

$(function () {
    $("#lastUpdate").datepicker({
        maxDate: '0'
    });
});

$().ready(function() {
    $("#newProductForm").validate({
        rules: {
            productName: {
                required: true,
                minlength: 2
            },
            logoUrl: {
                url: true,
                imageUrl: true
            },
            versionNum: {
                required: true,
                versionNum: true
            },
            lastUpdate: {
                required: true,
                validDate: true,
                dateBefore: true,
                afterTimestamp: true
            }
        },
        messages: {
            productName: {
                required: "Please enter a product name",
                minlength: "The product name must be at least 2 characters"
            },
            versionNum: {
                required: "Please enter a version number",
                versionNum: "Please enter a valid version number. # - #.# - #.#.#"
            },
            lastUpdate: {
                format: "The date entered is invalid.",
                validDate: "Please enter a valid date.",
                dateBefore: "Must be before today",
                dateAfter: "Must be after Jan 1, 1970"
            }
        }
    });
});

$.validator.addMethod( "imageUrl", function( value, element, param ) {
    param = typeof param === "string" ? param.replace( /,/g, "|" ) : "png|jpe?g|gif";
    return this.optional( element ) || value.match( new RegExp( "\\.(" + param + ")$", "i" ) );
}, $.validator.format( "Please enter a value with a valid extension." ) );

$.validator.addMethod("versionNum", function(value, element) {
    return this.optional( element ) || value.match( new RegExp( "^[0-9]*\.?[0-9]*\.?[0-9]+$" ));
}, $.validator.format( "Please enter a valid version number"));

$.validator.addMethod('validDate', function (value, element) {
    return this.optional(element) || /^(0?[1-9]|1[012])[ /](0?[1-9]|[12][0-9]|3[01])[ /][0-9]{4}$/.test(value);
}, 'Please provide a date in the mm/dd/yyyy format');

$.validator.addMethod('beforeToday', function (value, element, params) {

    var today = new Date();
    var date = new Date(value);

    return this.optional(element) || !(today < date);
}, 'Must be before today');

$.validator.addMethod('afterTimestamp', function (value, element, params) {

    var start = new Date("01/01/1970");
    var date = new Date(value);

    return this.optional(element) || !(start > date);

}, 'Must be after corresponding start date');