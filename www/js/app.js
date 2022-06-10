window.alert = function (msg) {
  ons.notification.alert({ message: JSON.stringify(msg), title: "Debug" });
};

angular
  .module("tictactoe", ["onsen", "tictactoelang", "TttService"])
  .controller("HomeCtrl", function ($scope, Ttt) {
    $scope.start = (com) => {
      myNavigator.pushPage("man2man.html");
      Ttt.init($scope.tr.game, com);
    };
    $scope.version = angular.version.full;
  })
  .controller("TttCtrl", [
    "$scope",
    "Ttt",
    function ($scope, Ttt) {
      var tr = $scope.tr;
      $scope.utl = Ttt;

      /** @param {number} index */
      $scope.onclick = (index) => {
        Ttt.onclick(index);
      };

      Ttt.onWin(() => {
        ons.notification.confirm({
          message: tr.game.continuePrompt,
          title: Ttt.getPlayersName()[Ttt.getCurrentPlayer()] + tr.game.wins,
          buttonLabels: tr.game.button,
          /** @param {number} index */
          callback: (index) => {
            switch (index) {
              case 0:
                Ttt.init(tr.game, Ttt.vsComputer);
                $scope.$apply();
                break;
              case 1:
                myNavigator.popPage();
                break;
            }
          },
        });
      });
    },
  ]);
