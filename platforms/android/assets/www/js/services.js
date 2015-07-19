angular.module('starter.services', [])
    .factory("BaiduNearByLocationService", function($http, $q) {
        return {
            getLocations: function(keyword, bLat, bLng) {
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
    });
