app.run(
		function($rootScope, $state, $stateParams) {
			$rootScope.$state = $state;
			$rootScope.$stateParams = $stateParams;
			$rootScope.$state.isLogin = false;
		}
	)
	.config(
		function($stateProvider, $urlRouterProvider) {
			$urlRouterProvider.when("", "app/calendar");
			$urlRouterProvider
				.otherwise('/access/404');
			$stateProvider
				.state('app', {
					abstract: true,
					url: '/app',
					templateUrl: '/tpl/admin_tpl/blocks/app.html'
				})
				.state('app.dashboard', {
					url: '/dashboard',
					templateUrl: '/tpl/admin_tpl/dashboard.html',
					/*onEnter:function($rootScope){
					
					},
					onExit:function(){
						console.log(2);
					}*/
					/*controllerProvider :function($rootScope){
						if($rootScope.$state.isLogin == false){
		                    $rootScope.$state.go('access.signin');
		                }
		                return function(){};
					}*/
				})
				.state('app.calendar', {
					url: '/calendar',
					templateUrl: '/tpl/admin_tpl/app_calendar.html',
					// use resolve to load other dependences
					resolve: {
						deps: ['$ocLazyLoad', 'uiLoad',
							function($ocLazyLoad, uiLoad) {
								return uiLoad.load(
									['/vendor/jquery/fullcalendar/fullcalendar.css',
										'/vendor/jquery/fullcalendar/theme.css',
										'/vendor/jquery/jquery-ui-1.10.3.custom.min.js',
										'/vendor/jquery/fullcalendar/fullcalendar.min.js',
										'/js/app/calendar/calendar.js'
									]
								).then(
									function() {
										return $ocLazyLoad.load('ui.calendar');
									}
								)
							}
						]
					}
				})
				.state('app.article', {
					abstract: true,
					url: '/article',
					template: '<div ui-view class="fade-in-up"></div>',			//new
					/*controller:'articleCtrl',*/
					resolve: {
	                      deps: ['$ocLazyLoad',
	                        function( $ocLazyLoad ){
	                          return $ocLazyLoad.load(['ui.select','angularFileUpload']).then(
	                              function(){
	                                  return $ocLazyLoad.load([
											'/js/services/article.client.service.js',
											'/js/controllers/article.client.controller.js'
	                                  ]);
	                              }
	                          );
	                      }]
	                  }					
				})
				.state('app.article.publish', {					//new
					url: '/publish',
					templateUrl: '/tpl/admin_tpl/article/publish.html',
					controller:'articlePublishCtrl',
				})
				.state('app.article.list', {					//new
					url: '/list/:page',
					templateUrl: '/tpl/admin_tpl/article/list.html',
					controller:"articleListCtrl"
				})
				.state('app.article.search', {
					url: '/search',
					templateUrl: '/tpl/admin_tpl/article/search.html',
					controller:'articleSearchCtrl'
				})
				.state("app.friend",{
					url:"/friend",
					templateUrl:'/tpl/admin_tpl/setting/newFriend.html',
					controller:"settingCtrl",
					resolve: {
	                      deps: ['uiLoad',
	                        function( uiLoad){
	                          return uiLoad.load([
	                                '/js/services/setting.client.service.js',
	                                '/js/controllers/setting.client.controller.js'
	                          ]);
	                      }]
		            }
				})
				.state("app.category",{
					url:"/category",
					templateUrl:'/tpl/admin_tpl/cate_tag.html',
					controller:'categoryCtrl',
					resolve: {
                      deps: ['uiLoad',
                        function( uiLoad){
                          return uiLoad.load([
                                '/js/services/cate_tag.client.service.js',
                                '/js/controllers/cate_tag.client.controller.js'
                          ]);
                      }]
	                },
				})
				.state("app.users",{
					url:"/users",
					templateUrl:'/tpl/admin_tpl/users.html'
				})
				.state('app.setting', {
					abstract: true,
					url: '/setting',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: {
	                      deps: ['uiLoad',
	                        function( uiLoad){
	                          return uiLoad.load([
	                                '/js/services/setting.client.service.js',
	                                '/js/controllers/setting.client.controller.js'
	                          ]);
	                      }]
		                },
				})
				.state('app.setting.banner', {
					url: '/banner',
					templateUrl: '/tpl/admin_tpl/setting/banner.html'
				})
				.state('app.setting.banner.add', {
					url: '/banner_add',
					templateUrl: '/tpl/admin_tpl/setting/banner_add.html'
				})
				.state('app.setting.banner.list', {
					url: '/banner_list',
					templateUrl: '/tpl/admin_tpl/setting/banner_list.html'
				})
				.state('access', {
	                  url: '/access',
	                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
	             })
	             .state('access.signin', {
	            	 url: '/signin',
	                  templateUrl: '/tpl/admin_tpl/signin.html',
	                  resolve: {
	                      deps: ['uiLoad',
	                        function( uiLoad ){
	                          return uiLoad.load( ['/js/controllers/signin.js'] );
	                      }]
	                  }
	             })
	             .state('access.signup', {
	            	 url: '/signup',
	                  templateUrl: '/tpl/admin_tpl/signup.html',
	                  resolve: {
	                      deps: ['uiLoad',
	                        function( uiLoad ){
	                          return uiLoad.load( ['/js/controllers/signup.js'] );
	                      }]
	                  }
	             })
				.state('access.404', {
	                  url: '/404',
	                  templateUrl: '/tpl/admin_tpl/404.html'
	             })
				
		}
	);