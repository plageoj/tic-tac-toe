angular.module("tictactoelang", []).controller("LangCtrl", [
  "$scope",
  "$http",
  function ($scope, $http) {
    const getLang = (code) => {
      $http
        .get("lang/" + code + ".json")
        .success(function (d) {
          $scope.tr = d;
        })
        .error(function () {
          getLang("en");
        });
    };

    const language = navigator.language.substring(0, 2) || "en";
    getLang(language);
  },
]);
