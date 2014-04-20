xApp
    .controller('ModalCreateUserController', function($scope, $modalInstance, UsersFactory, flash, GROUPS) {
        $scope.user = {};
        $scope.groups = GROUPS;

        $scope.ok = function () {
            UsersFactory.create($scope.user,
                function(response) {
                    $modalInstance.close(response);
                },
                function(err) {
                    flash('danger', err.data);
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });