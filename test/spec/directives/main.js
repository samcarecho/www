'use strict';


describe('button directive', function () {
  var element, $scope;
  beforeEach(module('atadosApp'));
  beforeEach(inject(function ($compile, $rootScope) {
    $scope = $rootScope;
    element = $compile('<button type="submit" size="large"></button>')($scope);
  }));

  it('has class btn', function() {
    expect(element.hasClass('btn')).toBeTruthy();
  });

  it('has class primary when type is submit', function () {
    expect(element.hasClass('btn-primary')).toBeTruthy();
  });

  it('has correct size attribute', function() {
    expect(element.hasClass('btn-large')).toBeTruthy();
  });
});
