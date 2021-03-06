/**
 * Created by Alec on 2/9/2016.
 *
 * Handles validating the New Product form
 */

$(function () {
    $("#lastUpdate").datepicker({
        maxDate: '0'
    });
    $("#tags").tagit();
});

$().ready(function() {
    $("#newProductForm").validate({
        errorElement: 'div',
        rules: {
            productName: {
                required: true,
                minlength: 2,
                invalidChars: ["/"]
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
                dateRange: {}
            },
            tags: {
                require: true
            }
        },
        messages: {
            productName: {
                required: "Please enter a product name",
                minlength: "The product name must be at least 2 characters",
                invalidChars: "The product name cannot contain a '/'"
            },
            versionNum: {
                required: "Please enter a version number",
                versionNum: "Please enter a valid version number. # - #.# - #.#.#"
            },
            lastUpdate: {
                dateRange: "Please enter a date between Jan 1, 1970 and today"
            },
            tags: {
                required: "Please enter at least one tag"
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

$.validator.addMethod("dateRange", function(value, element, arg) {

    var dateBefore, dateAfter, dateEntered;

    if (arg.dateBefore) dateBefore = Date.parse(arg.dateBefore);
    else dateBefore = new Date();

    if (arg.dateAfter) dateAfter = Date.parse(arg.dateAfter);
    else dateAfter = Date.parse("1970-01-01");

    dateEntered = Date.parse(value);

    return this.optional(element) || ( (dateBefore >= dateEntered) && (dateAfter <= dateEntered) )

}, $.validator.format("Please specify a date between Jan 1, 1970 and today."));

$.validator.addMethod("numberOfTags", function(value, element, params) {
    var  minimum;

    if (params.minimum) minimum = params.minimum;
    else minimum = 1;

    return this.optional(element) || value.split(",").length > minimum;

}, "Please enter at least one tag");

$.validator.addMethod("invalidChars", function(value, element, params) {

    for (var i = 0; i < params.length; ++i) {
        if (value.indexOf(params[0]) != -1) {
            return false;
        }
    }

    return true;
}, "An invalid character has been entered");