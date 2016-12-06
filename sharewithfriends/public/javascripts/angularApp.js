var app = angular.module('shareWithFriends', ['ui.router', 'ui.bootstrap']);

app.factory('posts', ['$http', function($http) {
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data){
			o.posts.push(data);
		});
	};

	o.deletePost = function(post) {
		return $http.delete('/posts/' + post._id).success(function(status){
			var index = o.posts.indexOf(post);
			o.posts.splice(index,1);
		});
	};

	o.upvote = function(post) {
  		return $http.put('/posts/' + post._id + '/upvote')
  		  .success(function(data){
      		post.upvotes += 1;
    	});
	};

	o.downvote = function(post) {
		return $http.put('/posts/' + post._id + '/downvote')
			.success(function(data){
				post.upvotes -= 1;
			});
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
    		return res.data;
  		});
	};

	o.addComment = function(id, comment) {
 		return $http.post('/posts/' + id + '/comments', comment);
	};

	o.upvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data){
				comment.upvotes += 1;
			});
	};

	return o;
}]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['posts', function(posts) {
						return posts.getAll();
					}]
				}
			})
			.state('about', {
				url: '/about',
				templateUrl: '/about.html',
				controller: 'AboutCtrl'
			})
			.state('posts', {
  				url: '/posts/{id}',
  				templateUrl: '/posts.html',
  				controller: 'PostsCtrl',
  					resolve: {
    					post: ['$stateParams', 'posts', function($stateParams, posts) {
      					return posts.get($stateParams.id);
    				}]
  				}
			});

		$urlRouterProvider.otherwise('home');
	}]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function($scope, posts){
		$scope.posts = posts.posts;
		$scope.addPost = function() {
			if(!$scope.title || $scope.title === '') { return; }
			posts.create({
				title: $scope.title, 
				link: $scope.link,
			});
			$scope.title = '';
			$scope.link = '';
		};
		$scope.incrementUpvotes = function(post) {
  			posts.upvote(post);
		};

		$scope.downvote = function(post) {
			posts.downvote(post);
		};

		$scope.deletePost = function(post) {
			posts.deletePost(post);
		};
	}]);

app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function($scope, posts, post) {
		$scope.post = post;
		$scope.addComment = function(){
 			if($scope.body === '') { return; }
  			posts.addComment(post._id, {
    			body: $scope.body,
    			author: 'user',
  			}).success(function(comment) {
    			$scope.post.comments.push(comment);
  			});
  		$scope.body = '';
		};
		$scope.upvote = function(comment) {
  			posts.upvoteComment(post, comment);
  		};
	}]);

app.controller('AboutCtrl', ['$scope', function($scope){
	var ctr = this;
	ctr.text = "About Test";
}]);

app.controller('DropDownCtrl', function($scope, $log) {
	$scope.items = [
    'The first choice!',
    'And another choice for you.',
    'but wait! A third!'
  ];

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));
});