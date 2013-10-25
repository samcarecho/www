'use strict';

var app = angular.module('atadosApp');

app.filter('as_location_string', function() {
  return function(address) {
    if (!address) {
      return '';
    }

    var out = address.addressline + ', ';
    out += address.addressnumber + ' - ';
    out += address.suburb.name + ' - ';
    out += address.city.name + ', ' + address.state.code;
    out += ' - ' + address.zipcode;
    return out;
  };
});
