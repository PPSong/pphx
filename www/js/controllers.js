angular.module('starter.controllers', ['starter.services', 'starter.filters', 'starter.directives', 'firebase'])

.controller('LoginCtrl', function($scope, $state, $ionicLoading, PPHttp, CurUserService, $firebaseObject) {
    $scope.uData = {};
    $scope.login = function() {
        //$ionicLoading.show();

        PPHttp.do(
            'p',
            'login', {
                username: $scope.uData.username,
                password: $scope.uData.password
            },
            //success
            function(data, status) {
                var ref = new Firebase("https://pphx.firebaseio.com/users/" + data.ppData.username);

                var obj = $firebaseObject(ref);

                obj.$loaded().then(function() {
                    CurUserService.setCurUser(obj);
                    $state.go("tab.meet");
                    // $ionicLoading.hide();
                });
            }
        );
    };
})

.controller('RegisterCtrl', function($scope, $state, OptionService, PPHttp) {
    $scope.uData = {};

    $scope.chooseOptionSex = function() {
        OptionService.initOption($scope.uData, ['男', '女'], 'sex', '性别');
    };

    $scope.register = function() {
        PPHttp.do(
            'p',
            'register', {
                username: $scope.uData.username,
                password: $scope.uData.password,
                sex: $scope.uData.sex,
                nickname: $scope.uData.nickname
            },
            //success
            function(data, status) {
                $state.go("login");
            }
        );
    };
})

.controller('TabsCtrl', function($ionicHistory, $scope, $rootScope, $state, $firebaseArray, $ionicScrollDelegate, $timeout, MeetService, FriendService, MessageService, CurUserService) {
    $scope.targets = {
        data: null
    };

    $scope.curTarget = {
        data: null
    };

    $scope.lastLocation = {
        data: null
    };

    $scope.curMeet = {
        data: null
    }

    $scope.targetSpecialInfo = {
        data: {}
    };

    $scope.$watch('targetSpecialInfo.data.sex', function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.targetSpecialInfo = {
                data: {
                    sex: newValue,
                    place: $scope.targetSpecialInfo.data.place
                }
            }
        }
    });

    $scope.curUser = CurUserService.getCurUser();

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
    $scope.hxFromMessages = $firebaseArray($scope.hxFireBase.child("messages").orderByChild("from").equalTo($scope.curUser.username));

    $scope.hxFromMessages.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.messages[event.key] = ($scope.hxFromMessages.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.messages[event.key];
            } else if (event.event == 'child_changed') {
                $scope.messages[event.key] = ($scope.hxFromMessages.$getRecord(event.key));
            }

        }
    );

    $scope.hxToMessages = $firebaseArray($scope.hxFireBase.child("messages").orderByChild("to").equalTo($scope.curUser.username));

    $scope.hxToMessages.$watch(
        function(event) {
            if (event.event == 'child_added') {
                $scope.messages[event.key] = ($scope.hxToMessages.$getRecord(event.key));
            } else if (event.event == 'child_removed') {
                delete $scope.messages[event.key];
            } else if (event.event == 'child_changed') {
                $scope.messages[event.key] = ($scope.hxToMessages.$getRecord(event.key));
            }
            if ($state.is('tab.friend.chat')) {
                $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(true);
                }, 300);
            }
        }
    );

    $scope.getUnreadTotalNum = function() {
        var result = 0;
        for (var key in $scope.messages) {
            if (($scope.messages[key].to === $scope.curUser.username) && $scope.messages[key].unread) {
                result++;
            }
        }
        return result;
    }
})

.controller('SearchSpecialPicCtrl', function($scope, $ionicModal, $state, $ionicLoading, PPHttp) {
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

    $scope.checkBigSpecialPic = function(item) {
        $scope.curTarget.data = item;
        $scope.modalBigSpecialPic.show();
    };

    $scope.closeBigSpecialPic = function() {
        $scope.modalBigSpecialPic.hide();
    }

    $scope.selectSuccess = function() {
        $ionicLoading.show({
            template: '处理中...'
        });
        PPHttp.do(
                'p',
                'createMeetClickTarget', {
                    token: $scope.curUser.token,
                    username: $scope.curTarget.data.username,
                    mapLocName: $scope.targetSpecialInfo.data.place.name,
                    mapLocUid: $scope.targetSpecialInfo.data.place.uid,
                    mapLocAddress: $scope.targetSpecialInfo.data.place.address
                },
                //success
                function(data, status) {
                    $scope.modalBigSpecialPic.hide();
                    $scope.modalCreateMeetSuccess.show();
                }
            )
            .finally(
                function() {
                    $ionicLoading.hide();
                }
            );

    }

    $scope.goToMeetTab = function() {
        $state.go("tab.meet");
    }

    $scope.createNeedConfirm = function() {
        $ionicLoading.show({
            template: '处理中...'
        });
        PPHttp.do(
                'p',
                'createMeetNo', {
                    token: $scope.curUser.token,
                    mapLocName: $scope.targetSpecialInfo.data.place.name,
                    mapLocUid: $scope.targetSpecialInfo.data.place.uid,
                    mapLocAddress: $scope.targetSpecialInfo.data.place.address,
                    sex: $scope.targetSpecialInfo.data.sex,
                    hair: $scope.targetSpecialInfo.data.hair,
                    glasses: $scope.targetSpecialInfo.data.glasses,
                    clothesType: $scope.targetSpecialInfo.data.clothesType,
                    clothesColor: $scope.targetSpecialInfo.data.clothesColor,
                    clothesStyle: $scope.targetSpecialInfo.data.clothesStyle
                },
                //success
                function(data, status) {
                    $state.go("tab.meet");
                }
            )
            .finally(
                function() {
                    $ionicLoading.hide();
                }
            );
    }
})

.controller('SearchSpecialPicReplyCtrl', function($scope, $ionicModal, $state, $ionicLoading, $cordovaToast, PPHttp) {
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

    $scope.checkBigSpecialPic = function(item) {
        $scope.curTarget.data = item;
        $scope.modalBigSpecialPic.show();
    };

    $scope.closeBigSpecialPic = function() {
        $scope.modalBigSpecialPic.hide();
    }

    $scope.selectSuccess = function() {
        if ($scope.curTarget.data.username == 'fake') {
            PPHttp.do(
                'p',
                'selectFake', {
                    token: $scope.curUser.token
                },
                //success
                function(data, status) {
                    $cordovaToast.showShortCenter('没猜对,请仔细选择图片!');
                }
            ).finally(
                function() {
                    $scope.modalBigSpecialPic.hide();
                    $state.go("tab.meet");
                }
            );
        } else {
            console.log($scope.curMeet.data);
            PPHttp.do(
                'p',
                'replyMeetClickTarget', {
                    token: $scope.curUser.token,
                    username: $scope.curMeet.data.createrUsername,
                    meetId: $scope.curMeet.data._id
                },
                //success
                function(data, status) {
                    //PPHttp.doRefreshAll();
                    $cordovaToast.showShortCenter('恭喜你!已加入好友列表,赶紧行动吧!');
                }
            ).finally(
                function() {
                    $scope.modalBigSpecialPic.hide();
                    $state.go("tab.meet");
                }
            );
        }

    }

    $scope.noTarget = function() {
        $state.go("tab.meet");
    }

    $scope.$on('$destroy', function() {
        $scope.modalBigSpecialPic.remove();
        $scope.modalCreateMeetSuccess.remove();
    });
})

.controller('SearchSpecialPicConfirmCtrl', function($scope, $ionicModal, $state, $ionicLoading, $cordovaToast, PPHttp) {
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

    $scope.checkBigSpecialPic = function(item) {
        $scope.curTarget.data = item;
        $scope.modalBigSpecialPic.show();
    };

    $scope.closeBigSpecialPic = function() {
        $scope.modalBigSpecialPic.hide();
    }

    $scope.selectSuccess = function() {
        PPHttp.do(
                'p',
                'confirmMeetClickTarget', {
                    token: $scope.curUser.token,
                    username: $scope.curTarget.data.username,
                    meetId: $scope.curMeet.data._id
                }
            )
            .finally(
                function() {
                    $scope.modalBigSpecialPic.hide();
                    $state.go("tab.meet");
                }
            );
    }

    $scope.noTarget = function() {
        $state.go("tab.meet");
    }

    $scope.$on('$destroy', function() {
        $scope.modalBigSpecialPic.remove();
        $scope.modalCreateMeetSuccess.remove();
    });
})


.controller('MeetCtrl', function($scope, $rootScope, $ionicModal, $state, $cordovaToast, $cordovaCamera, $ionicLoading, $cordovaGeolocation, $ionicPopup, OptionService, PPHttp) {
    $scope.selfSpecialInfo = {};

    $scope.showRemind = function() {
            if ($scope.curUser.lastRemind) {
                if ($scope.curUser.specialInfoTime) {
                    return $scope.curUser.specialInfoTime < $scope.curUser.lastRemind;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }
        // An alert dialog
    $scope.popupBigPic = function() {
        var alertPopup = $ionicPopup.alert({
            //title: 'Don\'t eat that!',
            template: ' <img class="pp-special-pic-big" src="' + ($scope.selfSpecialInfo.specialPic || $scope.curUser.specialInfo.specialPic) + '">'
        });
    };

    $scope.getImg = function(item) {
        if (item.createrUsername === $scope.curUser.username) {
            if (item.status === "待确认") {
                return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxANDxANDxAREA0OEA8VDxAPDA8NDw8QFRIWFhURExMYHCggGBwlHBUTITEhJSkrLi4uFx8zODMsNygtLysBCgoKDQ0OGxAQFywcHCQsLCwsLCwsLCwsKywsLCwsLCwsLC84NywsLCwsKywrLCwsLDcsLCssNywsNyssLCw3K//AABEIANgAxAMBIgACEQEDEQH/xAAbAAEAAwEBAQEAAAAAAAAAAAAAAQIFBgQDB//EAEMQAAICAQEEBAoFCAsAAAAAAAABAhEDBAUhMVEGEkFhEyJxcoGCkbHB0SMyM0KhFRZSU2JzkvEUNENkk6KjsuHi8P/EABgBAQADAQAAAAAAAAAAAAAAAAABAgME/8QAHREBAQEAAwEBAQEAAAAAAAAAAAECAxExIRJBUf/aAAwDAQACEQMRAD8A66hRNCjdzooUTQoCKFE0KAihRNCgIoUTR8suohB1KST5Nkj6UKM7JtaKfixclzvqlfyuv1b/AIkT+ajuNOhRmfldfq/8yL49rRbqUWlztP2j807jQoUVxZYz+rJPyMvRCUUKJoUQIoUTQoCKFE0KAihRNCgIogtQAtQokEoRQokARQokARQoTkoq20lzbpGZqdqNSqCTiu1p72JOzt89ftBSXVx2t++XD0IzKPpOTk3J8W7ZU2k6UtVBYEoVBYAVo++DVTxu07XJ70fIAb2i1kcu7hNLfH4o9NHMwk4tNOmuDRtbO1vhPEl9pv38FIy1npeV7aFEgqlFCiQBFCiQBFAkAWoUTQoJRQomhQEUKJPlq83g4OdXyXewhhbQzPJkfYo7kuVdp56JoUbRmihRNCiRFCiaFARQomhQEUKJoUBFBbt63NcGuwmhQHRaPL4SEZOrfGuZ9qM3YmTdKHJ2vIaZjZ1WkRQomhRCUUKJoUBFAmgBYEgIQCQBB4dsfZeWSrvPeYm1czlNw+7DhXa+ZOZ3UV4ASDZRAJAEA+2n008r6uOEpy5Ri5V5eRrYOimrnvcIw8+aT9iIupPamS3xhg6N9DdTzx/xv5Hi1fR3VYVbxOSXbBqf4LeRN5v9T+df4yQSCyqASAPRs5Pwseq0n39q7UdAcwm1vW5rgdNjlaT5pMz2tlIJBRZAJAEAkAWoUWoUEq0KLUKArRzeqg45Jp731n6TpqMjbOCnHIlx3S5X2fEti/VdMuhRahRqorRv9EdlYtVPJ4VNrEoNRTpNtvj7DCo6zoB9fUebi98inJbM1fE7067BghjioQioxXBRSSPoY+0+keDT3G/CZF92FOn3vgjntR0yzSfiY4QXe3N+3d7jmnHqt7vMdyDhcHTHPF+PDHNdqpwfof8Awdhs3XQ1OKOaHCXY+MWuKY1i59Tnc14zukHR+Gqi5wShnXCS3KfdL5n53ODi3FqpJtNPimuKP18/PemOnUNXJrhkjGXp4P3GnDq+M+XP9YNCi1CjoYKNHT4F4kfNj7jm1G3S3t8DqEjPa2UUKLUKKLq0KLUKArQLUAJBNCghAJoUBB5NqxvFLup+hM9lHn1uaMINSaTlF0uLYnpXO0CUiTdmqffT6vJijOMJOKyJKdbm0r3X6WfIAVoFgBU/QOhunlj0qct3hJykl3bkvcc/0b2C9S1lyKsEXw7cj5Lu7zvIpJUtyXBLckjn5tzxvxZ/qTgOmmZT1XVX3IRT8u9/E7DbO046TG5y3zdqEb3yl8j82zZZZJSnJ3Kbbk+bY4c/ezl186fIFgdDB6tlY+tlT/RTZumbsTGqnLttL0cTToy1fq8QCaFFUoBNCgIBNACwLUKCVQWoUBUydtw8aEuaa9n8zYozNuQ3QfYm17f5E59VvjHBahRsoqC1CgKm30a2L/Spuc92GDV/ty/RXxMVn6bsnSrBgx41xUV1vOe9/iZ8uvzPjTjz3XrhFRSikkkqSSpJcjx7W2nDSY+vPe3fUgnvm+S+Z65zUU5Pcoptvkkfmm1NfPVZXll2/VjxUI9iMOPH6rbe/wAxTaOuyanI8mR73wS4RXJHlLUKOuTpzKgtQoIauxIvqzf3W1S7+1+40jzbKhWKPe2/xPXRjr1pPFQWoUQlUFqFAVBagBIJoUEIBNCgIo8m1MPXxuuMXfzPZRIlHKE0aGs2bKFyjThvfJpHgNpe1EUKJBKFaP1c/Kjqvzx/u/8Ar/8AQx5c3XXTXj1J326DazrT5v3U/wDaz8zo6fV9K/C454/AV14tX4a6tca6pzVE8WbmfUcmpb8RQokGrNFEFi2ONyiuNtbue8De0MHHFBPjXvPuWaIow7aIBNCgIBNCgIJFAC1Ci1CglWhRahQFaFFqFAVavdzTOXlBxbi+KbTOqOf2lCssu+n+BfFV08lCi1CjRRWjuPzV037f+IcTR+pGPNqzrptxSXvtzev6N6fHiyTj1+tCEmrnatI4+j9J2t/V837ufuPziieK2z6jlkl+K0KLUKNWStG1sfAow69eNJ7nySMrDic5KC4t/wDmdLCCilFcEqXoKbq2YihRahRmurQotQoCtCi1CgK0C1ACQWAQqCwAqCwAqYu2V9L6q+JuUYm2F9L6q+JbPqNePACaFGqiDa/OfU84fwGNQorZL6mWzxq5+kWfJGUJdTqyTTqHYzJomhRMknhbb6gE0KJQ9mx19L6rNyjF2OvpfVZtmW/V4qCwKpVBYAVBYAVJJAE0KLUKArQotQoCtCi1Fck1FdaTSS7WAoxNrtPLud1FJ1zLa7aDyXCG6Ha+EpfI8NGmc9fVbUUKJBdVFCiQBFCiQBFCiQB79ixXXlz6u72mycuufaaGk2m47slyjz+8vmZ6zb9Wla9ChCSklJO0+DLUUWVoUWoUBWhRahQFaBagBYE0ROSirbSS7WQkKzkoq5NJd7oz9TtVcMa3/pSXDyIy8k3J3Jtvv315C8xVbpr5dqY19VOXk3L2mbq9XLM1dJK6SPgC8zIraigSCyEAkAQCQBAJAEAkAQCQB7Nm6tYm1K+rKuH3Xzo18OohP6sk3y7TnBRS5lWmnUAwsGvyQ7esuUvmaWDaOOe5vqvlLh7SlzYt29YJQoqlAJoAWMrbi+z9Y1qMvbn9n6xfPqt8ZIJBqogEgCASAIBIAgEgCASAIBIAgEgCASAIFEgDX2Ivo5ef8DRPBsT7OXn/AANCjHXrSeIBNAgWMvbi+z9YAtn0vjKoUAasyhQBAUKAAUKAAUKAAUKAAUKAAUKAAUKAAUKAA2diL6OXn/A0ADLXrSeAAIH/2Q==";
            } else {
                return item.targetSpecialPic;
            }
        } else {
            if (item.status === "待回复") {
                return "data:image/jpeg;base64,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";
            } else {
                return item.createrSpecialPic;
            }
        }
    };

    $scope.chooseOptionPlace = function(object) {
        OptionService.initOptionWithInput(object, 'place', '场所', $scope.lastLocation.data);
    };

    $scope.chooseOptionSex = function(object) {
        OptionService.initOption(object, ['男', '女'], 'sex', '性别');
    };

    $scope.chooseOptionHair = function(object) {
        var tmpSex;
        if ($scope.modalSpecialInfo.isShown()) {
            tmpSex = $scope.curUser.specialInfo.sex;
        } else {
            tmpSex = $scope.targetSpecialInfo.data.sex;
        }
        if (tmpSex == "男") {
            OptionService.initOption(object, ['长(男)', '短(男)'], 'hair', '发型');
        } else {
            OptionService.initOption(object, ['长(女)', '短(女)'], 'hair', '发型');
        }
    };

    $scope.chooseOptionGlasses = function(object) {
        OptionService.initOption(object, ['带', '不带'], 'glasses', '眼镜');
    };

    $scope.chooseOptionClothesType = function(object) {
        var tmpSex;
        if ($scope.modalSpecialInfo.isShown()) {
            tmpSex = $scope.curUser.specialInfo.sex;
        } else {
            tmpSex = $scope.targetSpecialInfo.data.sex;
        }
        if (tmpSex == "男") {
            OptionService.initOption(object, ['大衣(男)', '衬衫(男)'], 'clothesType', '衣服类型');
        } else {
            OptionService.initOption(object, ['大衣(女)', '衬衫(女)'], 'clothesType', '衣服类型');
        }
    };

    $scope.chooseOptionClothesColor = function(object) {
        var tmpSex;
        if ($scope.modalSpecialInfo.isShown()) {
            tmpSex = $scope.curUser.specialInfo.sex;
        } else {
            tmpSex = $scope.targetSpecialInfo.data.sex;
        }
        if (tmpSex == "男") {
            OptionService.initOption(object, ['黑(男)', '白(男)'], 'clothesColor', '衣服颜色');
        } else {
            OptionService.initOption(object, ['黑(女)', '白(女)'], 'clothesColor', '衣服颜色');
        }
    };

    $scope.chooseOptionClothesStyle = function(object) {
        var tmpSex;
        if ($scope.modalSpecialInfo.isShown()) {
            tmpSex = $scope.curUser.specialInfo.sex;
        } else {
            tmpSex = $scope.targetSpecialInfo.data.sex;
        }
        if (tmpSex == "男") {
            OptionService.initOption(object, ['纯色(男)', '条纹(男)'], 'clothesStyle', '衣服花纹');
        } else {
            OptionService.initOption(object, ['纯色(女)', '条纹(女)'], 'clothesStyle', '衣服花纹');
        }
    };

    $scope.editSpecialInfo = function() {
        //上传当前地理位置
        var posOptions = {
            timeout: 10000,
            enableHighAccuracy: true
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            var lat = position.coords.latitude;
            var long = position.coords.longitude;

            //发送当前地理位置
            PPHttp.do(
                'p',
                'updateLocation', {
                    lng: long,
                    lat: lat,
                    token: $scope.curUser.token
                },
                //success
                function(data, status) {
                    $scope.selfSpecialInfo = {};
                    $scope.modalSpecialInfo.show();
                }
            )

        }, function(err) {
            // error
            $cordovaToast.showShortCenter(err);
            console.log(err);
        });
    };
    $scope.saveSpecialInfo = function() {
        $scope.modalSpecialInfo.hide();
        if (Object.keys($scope.selfSpecialInfo).length > 0) {
            PPHttp.do(
                'p',
                'updateSpecialInfo', {
                    token: $scope.curUser.token,
                    hair: $scope.selfSpecialInfo.hair || $scope.curUser.specialInfo.hair,
                    glasses: $scope.selfSpecialInfo.glasses || $scope.curUser.specialInfo.glasses,
                    clothesType: $scope.selfSpecialInfo.clothesType || $scope.curUser.specialInfo.clothesType,
                    clothesColor: $scope.selfSpecialInfo.clothesColor || $scope.curUser.specialInfo.clothesColor,
                    clothesStyle: $scope.selfSpecialInfo.clothesStyle || $scope.curUser.specialInfo.clothesStyle,
                    specialPic: $scope.selfSpecialInfo.specialPic || $scope.curUser.specialInfo.specialPic
                }
            )
        }
    };
    $scope.createMeet = function() {
        $scope.targetSpecialInfo.data = {};
        var posOptions = {
            timeout: 10000,
            enableHighAccuracy: true
        };

        $ionicLoading.show({
            template: '努力中...'
        });

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            var lat = position.coords.latitude;
            var long = position.coords.longitude;

            //发送当前地理位置
            PPHttp.do(
                    'p',
                    'updateLocation', {
                        lng: long,
                        lat: lat,
                        token: $scope.curUser.token
                    },
                    //success
                    function(data, status) {
                        $scope.lastLocation.data = data.ppData.lastLocation;

                        //sendMeetCheck
                        PPHttp.do(
                                'p',
                                'sendMeetCheck', {
                                    token: $scope.curUser.token
                                },
                                function(data, status) {
                                    if (data.ppResult == 'ok') {
                                        //设置默认性别
                                        $scope.targetSpecialInfo.data.sex = ($scope.curUser.specialInfo.sex === '男' ? '女' : '男');
                                        $scope.modalCreateMeet.show();
                                    }
                                }
                            )
                            .finally(
                                function() {
                                    $ionicLoading.hide();
                                }
                            );
                    }
                )
                .finally(
                    function() {
                        $ionicLoading.hide();
                    }
                );
        }, function(err) {
            // error
            $cordovaToast.showShortCenter(err);
            $ionicLoading.hide();
            console.log(err);
        });

    };
    $scope.closeCreateMeetModal = function() {
        $scope.modalCreateMeet.hide();
    };
    $scope.closeReplyMeetModal = function() {
        $scope.modalReplyMeet.hide();
    };
    $scope.closeWaitForReply = function() {
        $scope.modalWaitForReply.hide();
    };

    $scope.clickMeet = function(item) {
        $scope.curMeet.data = item;
        if (item.createrUsername === $scope.curUser.username) {
            if (item.status === "待确认") {
                //resetNewMatchNum
                PPHttp.do(
                    'p',
                    'resetNewMatchNum', {
                        token: $scope.curUser.token,
                        meetId: item._id,
                    }
                );

                $scope.targetSpecialInfo.data = item.specialInfo;
                $scope.targetSpecialInfo.data.place = item.mapLoc;
                $ionicLoading.show({
                    template: '努力搜索中...'
                });

                PPHttp.do(
                        'p',
                        'createMeetSearchTarget', {
                            token: $scope.curUser.token,
                            sex: $scope.targetSpecialInfo.data.sex,
                            hair: $scope.targetSpecialInfo.data.hair,
                            glasses: $scope.targetSpecialInfo.data.glasses,
                            clothesType: $scope.targetSpecialInfo.data.clothesType,
                            clothesColor: $scope.targetSpecialInfo.data.clothesColor,
                            clothesStyle: $scope.targetSpecialInfo.data.clothesStyle
                        },
                        function(data, status) {
                            if (data.ppResult == 'ok') {
                                $scope.targets.data = data.ppData;
                                $state.go('tab.meet.searchSpecialPicConfirm');
                                $scope.modalCreateMeet.hide();
                            }
                        }
                    )
                    .finally(
                        function() {
                            $ionicLoading.hide();
                        }
                    );
            } else if (item.status === "待回复") {
                $scope.modalWaitForReply.show();
            }
        } else if (item.targetUsername === $scope.curUser.username) {
            if (item.status === "待回复") {
                var posOptions = {
                    timeout: 10000,
                    enableHighAccuracy: true
                };
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;

                    //发送当前地理位置
                    PPHttp.do(
                            'p',
                            'updateLocation', {
                                lng: long,
                                lat: lat,
                                token: $scope.curUser.token
                            },
                            //success
                            function(data, status) {
                                $scope.lastLocation.data = data.ppData.lastLocation;
                                $scope.targetSpecialInfo.data = {
                                    sex: $scope.curUser.specialInfo.sex === '男' ? '女' : '男'
                                };
                                $scope.modalReplyMeet.show();
                            }
                        )
                        .finally(
                            function() {
                                $ionicLoading.hide();
                            }
                        );
                }, function(err) {
                    // error
                    $cordovaToast.showShortCenter(err);
                    $ionicLoading.hide();
                    console.log(err);
                });



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

    $scope.searchCreateTarget = function() {
        if (!(
                $scope.targetSpecialInfo.data.sex && $scope.targetSpecialInfo.data.clothesColor && $scope.targetSpecialInfo.data.clothesStyle && $scope.targetSpecialInfo.data.clothesType && $scope.targetSpecialInfo.data.glasses && $scope.targetSpecialInfo.data.hair && $scope.targetSpecialInfo.data.place
            )) {
            console.log('请把条件填写完整');
            $cordovaToast.showShortCenter('请把条件填写完整');
            return;
        }

        $ionicLoading.show({
            template: '努力搜索中...'
        });

        PPHttp.do(
                'p',
                'createMeetSearchTarget', {
                    token: $scope.curUser.token,
                    sex: $scope.targetSpecialInfo.data.sex,
                    hair: $scope.targetSpecialInfo.data.hair,
                    glasses: $scope.targetSpecialInfo.data.glasses,
                    clothesType: $scope.targetSpecialInfo.data.clothesType,
                    clothesColor: $scope.targetSpecialInfo.data.clothesColor,
                    clothesStyle: $scope.targetSpecialInfo.data.clothesStyle
                },
                function(data, status) {
                    if (data.ppResult == 'ok') {
                        $scope.targets.data = data.ppData;
                        $state.go('tab.meet.searchSpecialPic');
                        $scope.modalCreateMeet.hide();
                    }
                }
            )
            .finally(
                function() {
                    $ionicLoading.hide();
                }
            );

    };

    $scope.searchReplyTarget = function() {
        if (!(
                $scope.targetSpecialInfo.data.sex && $scope.targetSpecialInfo.data.clothesColor && $scope.targetSpecialInfo.data.clothesStyle && $scope.targetSpecialInfo.data.clothesType && $scope.targetSpecialInfo.data.glasses && $scope.targetSpecialInfo.data.hair
            )) {
            console.log('请把条件填写完整');
            $cordovaToast.showShortCenter('请把条件填写完整');
            return;
        }

        $ionicLoading.show({
            template: '努力搜索中...'
        });

        PPHttp.do(
                'p',
                'replyMeetSearchTarget', {
                    token: $scope.curUser.token,
                    sex: $scope.targetSpecialInfo.data.sex,
                    hair: $scope.targetSpecialInfo.data.hair,
                    glasses: $scope.targetSpecialInfo.data.glasses,
                    clothesType: $scope.targetSpecialInfo.data.clothesType,
                    clothesColor: $scope.targetSpecialInfo.data.clothesColor,
                    clothesStyle: $scope.targetSpecialInfo.data.clothesStyle,
                    meetId: $scope.curMeet.data._id
                },
                function(data, status) {
                    if (data.ppResult == 'ok') {
                        if (!data.ppData) {
                            //特征信息不匹配
                            $cordovaToast.showShortCenter(data.ppMsg);
                        } else {
                            $scope.targets.data = data.ppData;
                            $state.go('tab.meet.searchSpecialPicReply');
                            $scope.modalReplyMeet.hide();
                        }
                    }
                }
            )
            .finally(
                function() {
                    $ionicLoading.hide();
                }
            );
    };

    $ionicModal.fromTemplateUrl('templates/modalCreateMeet.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function(modal) {
        $scope.modalCreateMeet = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modalReplyMeet.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function(modal) {
        $scope.modalReplyMeet = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modalSpecialInfo.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function(modal) {
        $scope.modalSpecialInfo = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modalWaitForReply.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function(modal) {
        $scope.modalWaitForReply = modal;
    });

    $scope.takePhoto = function() {
        try {
            var options = {
                quality: 30,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options)
                .then(function(imageData) {
                    $scope.selfSpecialInfo.specialPic = "data:image/jpeg;base64," + imageData;
                }, function(err) {
                    // error
                    // console.log(err);
                    $cordovaToast.showShortCenter(err);
                });
        } catch (err) {
            //console.log(err);
            $cordovaToast.showShortCenter(err);
        }
    }

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modalCreateMeet && $scope.modalCreateMeet.remove();
        $scope.modalSpecialInfo && $scope.modalSpecialInfo.remove();
        $scope.modalOption && $scope.modalOption.remove();
    });
})

.controller('FriendCtrl', function($scope, $state) {
    $scope.goToChat = function(item) {
        $state.go('tab.friend.chat', {
            friendUsername: $scope.curUser.username == item.username1 ? item.username2 : item.username1
        });
    };

    $scope.getUnreadNum = function(friendUsername) {
        var result = 0;
        for (var key in $scope.messages) {
            if (($scope.messages[key].from === friendUsername) && $scope.messages[key].unread) {
                result++;
            }
        }
        return result;
    }
})

.controller('ChatCtrl', function($scope, $state, $stateParams, $ionicScrollDelegate, PPHttp) {
    $scope.friendUsername = $stateParams.friendUsername;

    $scope.myBack = function() {
        for (var key in $scope.messages) {
            if ($scope.messages[key].from === $scope.friendUsername && $scope.messages[key].unread) {
                $scope.messages[key].unread = false;
                $scope.hxToMessages.$save($scope.messages[key]);
            }
        }

        //$scope.hxToMessages
        $state.go('tab.friend');
    }

    $scope.sendMessage = function() {
        if (!$scope.inputMessage) {
            return;
        }

        PPHttp.sendPushMessage($scope.hxFromMessages, {
            from: $scope.curUser.username,
            to: $scope.friendUsername,
            content: $scope.inputMessage,
            time: moment().valueOf(),
            unread: true
        });

        $scope.inputMessage = '';
        $timeout(function() {
            $ionicScrollDelegate.scrollBottom(true);
        }, 300);
    };
})

.controller('SettingCtrl', function($scope, $state, $timeout, $ionicHistory) {
    $scope.logout = function() {
        $state.go('login');

        // Clear all cache and history
        $timeout(function() {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
        }, 30)
    }
});