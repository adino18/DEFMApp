angular.module('kLaserCutterController.controllers', [])

.controller('DashCtrl', ["$scope", "Config", "Socket", "Canvas", "$ionicPopup", "$filter", "$ionicPosition", "$ionicScrollDelegate", function($scope, Config, Socket, Canvas, $ionicPopup, $filter, $ionicPosition, $ionicScrollDelegate) {
	
	$scope.started = false;
	$scope.type = 0;
	
	var socket_host = Config.get('socket_host');
	$scope.$on('$ionicView.enter', function(e) {
		Canvas.setVisibleSVG(Config.get('renderSVG'));	
		Socket.setRememberDevice(Config.get('rememberDevice'));
		Socket.setMaxLaserPower(Config.get('maxLaserPower'));
		Socket.setMachineHost(Config.get('machine_host'));
		if ($scope.started)
			Socket.setFeedRate(Config.get('feedRate'));	
		var new_host = Config.get('socket_host');
		//if you updated host
		if (new_host != socket_host) {
			var update = function() {
				Socket.disconnect()
				Socket.connect(new_host, $scope);
				socket_host = new_host;
			}
			console.log(Socket.isMachineRunning());
			if (Socket.isMachineRunning()) {
				var confirmPopup = $ionicPopup.confirm({
					title: $filter('translate')('ARE_YOU_SURE'),
					template: $filter('translate')('THE MACHINE IS RUNNING. ARE YOU SURE TO CHANGE TO THE NEW SOCKET ADDRESS?')
				});
				confirmPopup.then(function(res) {
					if (res)
						update();
				});
			} else
				update();
		}
	});
		
	//Config.set('socket_host', 'http://w.b:90/');
	$scope.machine	= new Vec2(0, 0);
	$scope.work		= new Vec2(0, 0);
    $scope.unit		= "mm";
    $scope.dpi		= 100;
    $scope.getConfig = Config.get;
	Socket.connect(socket_host, $scope);
	Canvas.init('coordsCanvas');
	Socket.connected;
	
	console.log($ionicPosition.position($("#motherCanvas")));
	$scope.socket.mjpgClass = "";
	$scope.fullscreen = function() {
		$scope.socket.mjpgClass = ($scope.socket.mjpgClass == "") ? "modalAbs" : "";
		if ($scope.socket.mjpgClass == "modalAbs") 
			$ionicScrollDelegate.scrollTop();
	};
	Canvas.setVisibleSVG(Config.get('renderSVG'));
	setTimeout(function() {
		$scope.started = true;
	}, 1000);
	$scope.modeA = false;
	$scope.modeB = false;
	$scope.modeC = false;
    $scope.selectmode = function(value){
		$scope.modeA = $scope.modeB = $scope.modeC = false;
		if(value == 1){
			$scope.modeA = true;
			Config.set('feedRate',100);
			Config.set('maxLaserPower',100);
		}else if(value == 2){
			$scope.modeB = true;
			Config.set('feedRate',200);
			Config.set('maxLaserPower',80);

		}else{
			$scope.modeC = true;
			Config.set('feedRate',350);
			Config.set('maxLaserPower',50);

		}
		console.log('feedRate'+" "+Config.get('feedRate'));
		console.log('maxLaserPower'+" "+Config.get('maxLaserPower'));
		
	}
	$scope. manual = function(value){
			Socket.setManual(value);
	}
	$scope.updateImg = function(dpi){
		console.log("configimage"+dpi);
		value = dpi;
		setTimeout(function() { Socket.setImageSize(value); }, 1500);

		
		//Socket.configimg(dpi);
	}
	$scope.changeTypeConvert = function(type){
		Socket.setTypeConvert2Svg(type);
		console.log("type" + type);
	}
	
}])

.controller('SettingsCtrl', ["$scope", "Config", function($scope, Config) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    $scope.configList;
	$scope.$on('$ionicView.enter', function(e) {
  		$scope.configList = Config.getList();
	});
	
	$scope.update = function(config) {
		console.log(config.key + " " + config.value);
		Config.set(config.key, config.value)
		if (config.onChange)
			config.onChange(config);
	}
}]);
