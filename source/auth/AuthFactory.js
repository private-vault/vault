xApp
    .factory('AuthFactory', function($resource, $cookieStore, $rootScope) {
        var cookieName = 'user';

        var apiEndpoint = function() {
            return $resource("/internal/auth");
        }

        var login = function(response) {
            $cookieStore.put(cookieName, response);
            $rootScope.$broadcast('auth:login', getUser());
        }

        var logout = function() {
            $cookieStore.remove(cookieName);
            $rootScope.$broadcast('auth:login', null);
        }

        var getUser = function() {
            return $cookieStore.get(cookieName) ;
        }

        return {
            api: apiEndpoint,
            login: login,
            logout: logout,
            getUser: getUser
        }
    });