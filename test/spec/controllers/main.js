'use strict';

describe('AppController', function () {

  // load the controller's module
  beforeEach(module('atadosApp'));

  var AppController, $scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    AppController = _$controller_('AppController', {
      $scope: $scope
    });
  }));

  it('shold have the site name and title on the scope', function () {
    expect($scope.site.name).toBe('Atados - Juntando Gente Boa');
    expect($scope.site.title).toBe('Juntando Gente Boa');
  });

  it('should log the user out', function () {
    var user = {username: 'testuser'};
    expect($scope.loggedUser).not.toBeDefined();
    $scope.loggedUser = user;
    expect($scope.loggedUser).toBe(user);
    $scope.logout();
    expect($scope.loggedUser).toBeNull();
  });
});
