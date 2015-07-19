angular.module('starter.controllers', ['starter.services', 'starter.filters', 'starter.directives', 'firebase'])

.controller('LoginCtrl', function($scope) {})

.controller('RegisterCtrl', function($scope) {})

.controller('TabsCtrl', function($scope, $rootScope, $state, MeetService, FriendService, MessageService, $firebaseArray) {
    $rootScope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = false;

        if ($state.current.name === 'tab.meet.searchSpecialPic' || $state.current.name === 'tab.meet.searchSpecialPicReply' || $state.current.name === 'tab.friend.chat') {
            $rootScope.hideTabs = true;
        }

        if ($state.current.name == 'tab.friend.chat') {
            cordova.plugins.Keyboard.disableScroll(true);
        } else {
            cordova.plugins.Keyboard.disableScroll(false);
        }
    });

    $scope.curUser = {
        username: "u1"
    }

    $scope.hxFireBase = new Firebase('https://pphx.firebaseio.com');

    $scope.meets = {};
    var hxCreaterMeets = $firebaseArray($scope.hxFireBase.child("meets").orderByChild("createrUsername").equalTo($scope.curUser.username));

    hxCreaterMeets.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.meets[event.key] = (hxCreaterMeets.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.meets[event.key];
            }
        }
    );

    var hxTargetMeets = $firebaseArray($scope.hxFireBase.child("meets").orderByChild("targetUsername").equalTo($scope.curUser.username));
    
    hxTargetMeets.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.meets[event.key] = (hxTargetMeets.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.meets[event.key];
            }
        }
    );

    $scope.friends = {};
    var hx1Friends = $firebaseArray($scope.hxFireBase.child("friends").orderByChild("username1").equalTo($scope.curUser.username));

    hx1Friends.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.friends[event.key] = (hx1Friends.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.friends[event.key];
            }
        }
    );

    var hx2Friends = $firebaseArray($scope.hxFireBase.child("friends").orderByChild("username2").equalTo($scope.curUser.username));

    hx2Friends.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.friends[event.key] = (hx2Friends.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.friends[event.key];
            }
        }
    );

    $scope.messages = {};
    var hxFromMessages = $firebaseArray($scope.hxFireBase.child("messages").orderByChild("from").equalTo($scope.curUser.username));

    hxFromMessages.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.messages[event.key] = (hxFromMessages.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.messages[event.key];
            }
        }
    );

    var hxToMessages = $firebaseArray($scope.hxFireBase.child("messages").orderByChild("to").equalTo($scope.curUser.username));

    hxToMessages.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.messages[event.key] = (hxToMessages.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.messages[event.key];
            }
        }
    );
})

.controller('SearchSpecialPicCtrl', function($scope, $ionicModal, $state) {
    $ionicModal.fromTemplateUrl('templates/modalBigSpecialPic.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalBigSpecialPic = modal;
    });
    $ionicModal.fromTemplateUrl('templates/modalCreateMeetSuccess.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalCreateMeetSuccess = modal;
    });

    $scope.$on('$destroy', function() {
        $scope.modalBigSpecialPic.remove();
        $scope.modalCreateMeetSuccess.remove();
    });

    $scope.checkBigSpecialPic = function() {
        $scope.modalBigSpecialPic.show();
    };

    $scope.closeBigSpecialPic = function() {
        $scope.modalBigSpecialPic.hide();
    }

    $scope.selectSuccess = function() {
        $scope.modalBigSpecialPic.hide();
        $scope.modalCreateMeetSuccess.show();
    }

    $scope.goToMeetTab = function() {
        $state.go("tab.meet");
    }

    $scope.createNeedConfirm = function() {
        $state.go("tab.meet");
    }
})

.controller('SearchSpecialPicReplyCtrl', function($scope, $ionicModal, $state) {
    $ionicModal.fromTemplateUrl('templates/modalBigSpecialPic.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalBigSpecialPic = modal;
    });
    $ionicModal.fromTemplateUrl('templates/modalCreateMeetSuccess.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalCreateMeetSuccess = modal;
    });

    $scope.checkBigSpecialPic = function() {
        $scope.modalBigSpecialPic.show();
    };

    $scope.closeBigSpecialPic = function() {
        $scope.modalBigSpecialPic.hide();
    }

    $scope.selectSuccess = function() {
        $scope.modalBigSpecialPic.hide();
        $state.go("tab.meet");
    }

    $scope.noTarget = function() {
        $state.go("tab.meet");
    }

    $scope.$on('$destroy', function() {
        $scope.modalBigSpecialPic.remove();
        $scope.modalCreateMeetSuccess.remove();
    });
})


.controller('MeetCtrl', function($scope, $rootScope, $ionicModal, $ionicPopup, $state, BaiduNearByLocationService) {
    $scope.selfSpecialInfo = {};
    $scope.targetSpecialInfo = {};

    $scope.initOption = function(object, options, itemName, title) {
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
    };

    $scope.initOptionWithInput = function(object, itemName, title) {
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
                    object[itemName] = thisScope.data.optionVal;
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

        BaiduNearByLocationService.getLocations('2', 40.056885, 116.30815).then(function(options) {
            thisScope.options = options;
        });
        thisScope.close = function() {
            object[itemName] = thisScope.data.optionVal;
            tmpPopup.close();
        };
    };


    $scope.chooseOptionPlace = function(object) {
        $scope.initOptionWithInput(object, 'place', '场所');
    };

    $scope.chooseOptionSex = function(object) {
        $scope.initOption(object, ['男', '女'], 'sex', '性别');
    };

    $scope.chooseOptionHair = function(object) {
        $scope.initOption(object, ['长', '短'], 'hair', '发型');
    };

    $scope.chooseOptionGlasses = function(object) {
        $scope.initOption(object, ['带', '不带'], 'glasses', '眼镜');
    };

    $scope.chooseOptionClotheType = function(object) {
        $scope.initOption(object, ['大衣', '衬衫'], 'clotheType', '衣服类型');
    };

    $scope.chooseOptionClotheColor = function(object) {
        $scope.initOption(object, ['黑', '白'], 'clotheColor', '衣服颜色');
    };

    $scope.chooseOptionClotheStyle = function(object) {
        $scope.initOption(object, ['纯色', '条纹'], 'clotheStyle', '衣服花纹');
    };

    $scope.editSpecialInfo = function() {
        $scope.modalSpecialInfo.show();
    };
    $scope.closeSpecialInfo = function() {
        $scope.modalSpecialInfo.hide();
    };
    $scope.createMeet = function() {
        $scope.modalCreateMeet.show();
    };
    $scope.closeCreateMeetModal = function() {
        $scope.modalCreateMeet.hide();
    };
    $scope.closeWaitForReply = function() {
        $scope.modalWaitForReply.hide();
    };

    $scope.clickMeet = function(item) {
        if (item.createrUsername === $scope.curUser.username) {
            if (item.status === "待确认") {
                $state.go('tab.meet.searchSpecialPic');
            } else if (item.status === "待回复") {
                $scope.modalWaitForReply.show();
            }
        } else if (item.targetUsername === $scope.curUser.username) {
            if (item.status === "待回复") {
                $state.go('tab.meet.searchSpecialPicReply');
            }
        }
    }

    $scope.goMeetDetail = function(waitForReply) {
        if (waitForReply) {
            $scope.modalWaitForReply.show();
        } else {
            $state.go('tab.meet.searchSpecialPic');

        }
    };

    $scope.searchSpecialPicReply = function() {
        $state.go('tab.meet.searchSpecialPicReply');
    };

    $scope.searchTarget = function() {
        $state.go('tab.meet.searchSpecialPic');
        $scope.modalCreateMeet.hide();
    };

    $ionicModal.fromTemplateUrl('templates/modalCreateMeet.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalCreateMeet = modal;

    });

    $ionicModal.fromTemplateUrl('templates/modalSpecialInfo.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalSpecialInfo = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modalWaitForReply.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalWaitForReply = modal;
    });


    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modalCreateMeet.remove();
        $scope.modalSpecialInfo.remove();
        $scope.modalOption.remove();
    });
})

.controller('FriendCtrl', function($scope, $state) {
    $scope.goToChat = function(item) {
        $state.go('tab.friend.chat', {
            friendUsername: $scope.curUser.username == item.username1 ? item.username2 : item.username1
        });
    };
})

.controller('ChatCtrl', function($scope, $stateParams) {
    $scope.friendUsername = $stateParams.friendUsername;
})

.controller('SettingCtrl', function($scope) {});