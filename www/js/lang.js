angular.module("tictactoelang", [])
    .controller("LangCtrl", ["$scope", "$http", "$timeout", function ($scope, $http, $timeout) {
        var ln;
        $timeout(function () {
            navigator.globalization.getLocaleName(function (lang) {
                ln = lang.value.substr(0, 2);
                getLang(ln);
            }, function () {
                getLang("en");
            });
        }, 1000);

        var getLang = function (code) {
            $http.get("lang/" + code + ".json").success(function (d) {
            	$scope.tr = d;
            }).error(function () {
                getLang("en");
            });
        };
        getLang("ja");
    }])