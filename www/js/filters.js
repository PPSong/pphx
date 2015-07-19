angular.module('starter.filters', [])
    .filter('friendMessage', function() {
        return function(messages, friendUsername) {
            var out = [];
            angular.forEach(messages, function(item) {
                if (item.from === friendUsername || item.to === friendUsername) {
                    out.push(item);
                }
            });
            return out;
        };
    });
