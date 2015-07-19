angular.module('starter.services', ['ngCordova', 'firebase'])
    .factory('PPHttp', function($http, $cordovaToast) {
        var serverRoot = "http://192.168.1.49:3000/";

        var handleSuccess = function(data, status) {
            console.log(data);
        };

        var handleErr = function(data, status, headers, config) {
            console.log(data);
            console.log(status);

            $cordovaToast
                .show((data && data.ppMsg) + '(' + status + ')', 'long', 'center')
                .then(function(success) {
                    // success
                }, function(error) {
                    // error
                });

            if (data.ppMsg === "认证错误!") {
                //todo logout
            }
        };

        return {
            do: function(methord, path, paramObj, success, err) {
                var s = success || handleSuccess;
                var e = err || handleErr;
                var p = paramObj || {};
                switch (methord) {
                    case 'g':
                        return $http.get(serverRoot + "users/" + path, p)
                            .success(s)
                            .error(e);
                        break;
                    case 'p':
                        return $http.post(serverRoot + "users/" + path, p)
                            .success(s)
                            .error(e);
                        break;
                    default:
                        return $http.post(serverRoot + "users/" + path, p)
                            .success(s)
                            .error(e);
                }
            },
            sendPushMessage: function(firebaseArray, messageObj) {
                firebaseArray.$add(
                    messageObj
                ).then(function(ref) {
                    console.log("added record with id " + ref.key());
                });
            }
        };
    })
    .factory("BaiduNearByLocationService", function($http, $q) {
        return {
            getLocations: function(keyword, bLng, bLat) {
                var dfd = $q.defer()

                var ak = "F9266a6c6607e33fb7c3d8da0637ce0b";
                var output = "json";
                var radius = "2000";
                var scope = "1";
                var data = "query=" + encodeURIComponent(keyword);
                data += "&ak=" + ak;
                data += "&output=" + output;
                data += "&radius=" + radius;
                data += "&scope=" + scope;
                data += "&location=" + bLat + "," + bLng;
                data += "&filter=sort_name:distance";

                $http.jsonp("http://api.map.baidu.com/place/v2/search?callback=JSON_CALLBACK&" + data)
                    .success(function(data, status, headers, config) {
                        //查询结果
                        dfd.resolve(data.results.map(
                            function(item) {
                                return {
                                    uid: item.uid,
                                    name: item.name,
                                    address: item.address
                                };
                            }
                        ));
                    })
                    .error(function(err) {
                        console.log(err);
                    });
                return dfd.promise;
            }
        }
    })
    .factory("MeetService", function($http, $q) {
        return {
            getMeets: function(username) {
                var dfd = $q.defer()

                $http.get('data/meets.json')
                    .success(function(data, status, headers, config) {
                        //查询结果
                        dfd.resolve(data);
                    })
                    .error(function(err) {
                        console.log(err);
                    });
                return dfd.promise;
            }
        }
    })
    .factory("FriendService", function($http, $q) {
        return {
            getFriends: function(username) {
                var dfd = $q.defer()

                $http.get('data/friends.json')
                    .success(function(data, status, headers, config) {
                        //查询结果
                        dfd.resolve(data);
                    })
                    .error(function(err) {
                        console.log(err);
                    });
                return dfd.promise;
            }
        }
    })
    .factory("MessageService", function($http, $q) {
        return {
            getMessages: function(username) {
                var dfd = $q.defer()

                $http.get('data/messages.json')
                    .success(function(data, status, headers, config) {
                        //查询结果
                        dfd.resolve(data);
                    })
                    .error(function(err) {
                        console.log(err);
                    });
                return dfd.promise;
            }
        }
    })
    .factory("OptionService", function($rootScope, $ionicPopup, BaiduNearByLocationService) {
        return {
            initOption: function(object, options, itemName, title) {
                var thisScope = $rootScope.$new(true);
                thisScope.data = {
                    optionVal: object[itemName]
                };

                var tmpPopup = $ionicPopup.show({
                    templateUrl: 'templates/popUpOption.html',
                    title: title || '请选择',
                    scope: thisScope
                });

                thisScope.options = options;
                thisScope.close = function() {
                    object[itemName] = thisScope.data.optionVal;
                    tmpPopup.close();
                };
            },

            initOptionWithInput: function(object, itemName, title, curLocation) {
                var thisScope = $rootScope.$new(true);
                thisScope.data = {};
                var tmpPopup = $ionicPopup.show({
                    templateUrl: 'templates/popUpOptionWithInput.html',
                    title: title || '请选择',
                    scope: thisScope,
                    buttons: [{
                        text: '确定',
                        type: 'button-positive',
                        onTap: function() {
                            if (thisScope.data.customVal) {
                                object[itemName] = {
                                    uid: 'custom',
                                    name: thisScope.data.customVal
                                };
                            } else {
                                object[itemName] = null;
                            }
                            return true;
                        }
                    }, {
                        text: '取消',
                        type: 'button-stable',
                        onTap: function() {
                            return false;
                        }
                    }]
                });

                thisScope.close = function() {
                    object[itemName] = thisScope.data.optionVal;
                    tmpPopup.close();
                };

                thisScope.keywordSearch = function(keyword) {
                    BaiduNearByLocationService.getLocations(keyword, curLocation[0], curLocation[1]).then(function(options) {
                        thisScope.options = options;
                    });
                }
            }
        }
    })
    .factory("CurUserService", function() {
        var curUser;
        return {
            getCurUser: function() {
                return curUser;
            },
            setCurUser: function(userData) {
                curUser = userData;
            }
        }
    });