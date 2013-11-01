'use strict';


describe('button directive', function () {
  var element, scope;
  beforeEach(module('atadosApp'));
  beforeEach(inject(function ($compile, $rootScope) {
    var linkingFn = $compile('<button></button>');
    scope = $rootScope;
    element = linkingFn(scope);
  }));
  it('has class btn', function() {
    expect(element.hasClass('btn')).toBe(true);
  });
});




