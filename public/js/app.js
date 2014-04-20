var xApp=angular.module("xApp",["ngRoute","ngSanitize","ngResource","ngAnimate","ngCookies","flash","ui.bootstrap","chieffancypants.loadingBar","angularMoment"]);xApp.config(["$routeProvider","$httpProvider","cfpLoadingBarProvider",function($routeProvider,$httpProvider,cfpLoadingBarProvider){$routeProvider.when("/login",{templateUrl:"/t/auth/login.html",controller:"AuthController"}).when("/user/list",{templateUrl:"/t/user/userList.html",controller:"UserListController",resolve:{users:function(UsersFactory){return UsersFactory.query()}}}).when("/home",{templateUrl:"/t/home/home.html",controller:"HomeController",resolve:{projects:function(ProjectsFactory){return ProjectsFactory.query()},entries:function(){return[]},activeProject:function(){return-1}}}).otherwise({redirectTo:"/login"}),$httpProvider.interceptors.push("AuthInterceptor"),cfpLoadingBarProvider.includeSpinner=!1}]),xApp.controller("AuthController",function($scope,$location,$sanitize,AuthFactory,flash){$scope.login=function(){AuthFactory.api().save({email:$sanitize($scope.email),password:$sanitize($scope.password)},function(response){AuthFactory.login(response),$location.path("/home")},function(response){flash("danger",response.data.flash)})}}),xApp.factory("AuthFactory",function($resource,$cookieStore,$rootScope){var cookieName="user",apiEndpoint=function(){return $resource("/internal/auth")},login=function(response){$cookieStore.put(cookieName,response),$rootScope.$broadcast("auth:login",getUser())},logout=function(){$cookieStore.remove(cookieName),$rootScope.$broadcast("auth:login",null)},getUser=function(){return $cookieStore.get(cookieName)};return{api:apiEndpoint,login:login,logout:logout,getUser:getUser}}),xApp.factory("AuthInterceptor",function($q,$injector,$location,flash){return{response:function(response){return response||$q.when(response)},responseError:function(rejection){if(401===rejection.status){var AuthFactory=$injector.get("AuthFactory");AuthFactory.logout(),flash("warning","Session has expired, please try again."),$location.path("/login")}return $q.reject(rejection)}}}),xApp.factory("EntriesFactory",function($resource){return $resource("/api/entry",{},{query:{method:"GET",isArray:!0},create:{method:"POST"}})}).factory("EntryFactory",function($resource){return $resource("/api/entry/:id",{},{show:{method:"GET"},update:{method:"PUT",params:{id:"@id"}},"delete":{method:"DELETE",params:{id:"@id"}}})}),xApp.controller("ModalCreateEntryController",function($scope,$modalInstance,EntriesFactory,flash,project_id,GROUPS){$scope.entry={project_id:project_id,group_access:{}},$scope.groups=GROUPS,$scope.ok=function(){EntriesFactory.create($scope.entry,function(response){$modalInstance.close(response)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.controller("ModalOpenAccessController",function($scope,$modalInstance,EntryFactory,flash,entry){$scope.entry=entry,$scope.ok=function(){EntryFactory.updateGroupAccess($scope.entry,function(response){$modalInstance.close(response)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.controller("ModalUpdateEntryController",function($scope,$modalInstance,EntryFactory,flash,entry,GROUPS){$scope.entry=entry,$scope.groups=GROUPS,$scope.ok=function(){EntryFactory.update($scope.entry,function(response){$modalInstance.close(response)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.constant("GROUPS",{admin:"Administrator",dev:"Developer",tester:"Tester",pm:"Project Manager"}),xApp.directive("loader",function(){return{restrict:"E",scope:{when:"="},template:'<img src="/img/loader.gif" ng-show="when">'}}),xApp.filter("userGroup",function(GROUPS){return function(input){return GROUPS[input]}}),angular.module("flash",[]).factory("flash",["$rootScope","$timeout",function($rootScope,$timeout){var reset,messages=[],cleanup=function(){$timeout.cancel(reset),reset=$timeout(function(){messages=[]})},emit=function(){$rootScope.$emit("flash:message",messages,cleanup)};$rootScope.$on("$locationChangeSuccess",emit);var asMessage=function(level,text){return text||(text=level,level="success"),{level:level,text:text}},asArrayOfMessages=function(level,text){return level instanceof Array?level.map(function(message){return message.text?message:asMessage(message)}):text?[{level:level,text:text}]:[asMessage(level)]},flash=function(level,text){return level==[]?void emit([]):void emit(messages=asArrayOfMessages(level,text))};return["error","warning","info","success"].forEach(function(level){flash[level]=function(text){flash(level,text)}}),flash}]).directive("flashMessages",[function(){var directive={restrict:"EA",replace:!0};return directive.template='<div ng-repeat="m in messages" class="alert alert-{{m.level}} text-center">{{m.text}}</div>',directive.controller=["$scope","$rootScope",function($scope,$rootScope){$rootScope.$on("flash:message",function(_,messages,done){$scope.messages=messages,done()})}],directive}]),xApp.directive("menu",[function(){var directive={restrict:"EA",replace:!0};return directive.template="<div ng-include=\"'/t/helpers/menu.html'\"></div>",directive.controller=["$scope","$rootScope","AuthFactory","$location","flash",function($scope,$rootScope,AuthFactory,$location,flash){$scope.login=AuthFactory.getUser(),$rootScope.$on("auth:login",function(_,login){$scope.login=login}),$scope.logout=function(){AuthFactory.api().get({},function(){AuthFactory.logout(),flash("info","You have been logged out!"),$location.path("/")})}}],directive}]),xApp.controller("HomeController",function($scope,projects,$modal,flash,ProjectKeysFactory,EntryFactory,ProjectFactory){$scope.projects=projects,$scope.entries=[],$scope.activeProject=-1,$scope.loading={entries:!1},$scope.openProject=function(index){$scope.activeProject=index,index>=0?($scope.loading.entries=!0,ProjectKeysFactory.keys({id:$scope.getProject().id},function(response){$scope.entries=response,$scope.loading.entries=!1})):$scope.entries=[]},$scope.getProject=function(){return $scope.projects[$scope.activeProject]},$scope.createEntry=function(){var modalInstance=$modal.open({templateUrl:"/t/entry/form.html",controller:"ModalCreateEntryController",resolve:{project_id:function(){return $scope.getProject().id}}});modalInstance.result.then(function(model){$scope.entries.push(model),flash([])},function(){flash([])})},$scope.updateEntry=function(index){var modalInstance=$modal.open({templateUrl:"/t/entry/form.html",controller:"ModalUpdateEntryController",resolve:{entry:function(EntryFactory){return EntryFactory.show({id:$scope.entries[index].id})}}});modalInstance.result.then(function(model){$scope.entries[index]=model,flash([])},function(){flash([])})},$scope.createProject=function(){var modalInstance=$modal.open({templateUrl:"/t/project/form.html",controller:"ModalCreateProjectController"});modalInstance.result.then(function(model){$scope.projects.push(model),flash([])},function(){flash([])})},$scope.updateProject=function(){var modalInstance=$modal.open({templateUrl:"/t/project/form.html",controller:"ModalUpdateProjectController",resolve:{project:function(ProjectFactory){return ProjectFactory.show({id:$scope.getProject().id})}}});modalInstance.result.then(function(model){$scope.projects[$scope.activeProject]=model,flash([])},function(){flash([])})},$scope.deleteProject=function(){confirm("Are you sure?")&&(ProjectFactory.delete({id:$scope.getProject().id}),$scope.projects.splice($scope.activeProject,1),$scope.openProject($scope.projects[0]?0:-1))},$scope.deleteEntry=function(index){confirm("Are you sure?")&&(EntryFactory.delete({id:$scope.entries[index].id}),$scope.entries.splice(index,1))},$scope.openAccess=function(index){var modalInstance=$modal.open({templateUrl:"/t/entry/access.html",controller:"ModalOpenAccessController",resolve:{entry:function(){return $scope.entries[index]}}});modalInstance.result.then(function(model){$scope.entries[index]=model,flash([])},function(){flash([])})}}),xApp.controller("ModalCreateProjectController",function($scope,$modalInstance,ProjectsFactory,flash){$scope.project={},$scope.ok=function(){ProjectsFactory.create($scope.project,function(response){$modalInstance.close(response)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.controller("ModalUpdateProjectController",function($scope,$modalInstance,ProjectFactory,flash,project){$scope.project=project,$scope.ok=function(){ProjectFactory.update($scope.project,function(){$modalInstance.close($scope.project)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.factory("ProjectsFactory",function($resource){return $resource("/api/project",{},{query:{method:"GET",isArray:!0},create:{method:"POST"}})}).factory("ProjectFactory",function($resource){return $resource("/api/project/:id",{},{show:{method:"GET"},update:{method:"PUT",params:{id:"@id"}},"delete":{method:"DELETE",params:{id:"@id"}},keys:{method:"GET",params:{id:"@id"}}})}).factory("ProjectKeysFactory",function($resource){return $resource("/api/project/keys/:id",{},{keys:{method:"GET",params:{id:"@id"},isArray:!0}})}),xApp.controller("ModalCreateUserController",function($scope,$modalInstance,UsersFactory,flash,GROUPS){$scope.user={},$scope.groups=GROUPS,$scope.ok=function(){UsersFactory.create($scope.user,function(response){$modalInstance.close(response)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.controller("ModalUpdateUserController",function($scope,$modalInstance,UserFactory,flash,user,GROUPS){$scope.user=user,$scope.groups=GROUPS,$scope.ok=function(){UserFactory.update($scope.user,function(){$modalInstance.close($scope.user)},function(err){flash("danger",err.data)})},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),xApp.controller("UserListController",function($scope,$resource,UsersFactory,UserFactory,$modal,users,flash){$scope.users=users,$scope.createUser=function(){var modalInstance=$modal.open({templateUrl:"/t/user/create.html",controller:"ModalCreateUserController"});modalInstance.result.then(function(model){$scope.users.push(model),flash([])},function(){flash([])})},$scope.updateUser=function(index){var modalInstance=$modal.open({templateUrl:"/t/user/create.html",controller:"ModalUpdateUserController",resolve:{user:function(UserFactory){return UserFactory.show({id:$scope.users[index].id})}}});modalInstance.result.then(function(model){$scope.users[index]=model,flash([])},function(){flash([])})},$scope.deleteUser=function(index){confirm("Are you sure?")&&(UserFactory.delete({id:$scope.users[index].id}),$scope.users.splice(index,1))}}).factory("UsersFactory",function($resource){return $resource("/api/user",{},{query:{method:"GET",isArray:!0},create:{method:"POST"}})}).factory("UserFactory",function($resource){return $resource("/api/user/:id",{},{show:{method:"GET"},update:{method:"PUT",params:{id:"@id"}},"delete":{method:"DELETE",params:{id:"@id"}}})});