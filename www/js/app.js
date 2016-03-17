window.alert = function (msg) { ons.notification.alert({ message: JSON.stringify(msg), title: "Debug" }); }

angular.module("tictactoe", ["onsen", "tictactoelang"])
    .service("Ttt", function ($timeout) {
    	var who = [], waiting;
    	var current = 0, onwin;
    	var that = this;

    	var msgSet = function () {
    		return who[current / 2] + waiting;
    	};

    	that.what = ["fa-times", "", "fa-circle-o"];

    	that.init = function (langObj, com) {
    		current = 0;
    		that.table = [];
    		for (var i = 0; i < 3; i++) {
    			that.table.push([{ count: 0, text: 1 }, { count: 0, text: 1 }, { count: 0, text: 1 }]);
    		}

    		who = com ? langObj.computer : langObj.players;
    		waiting = langObj.phase;
    		that.msg = msgSet();

    		that.vsComputer = com;
    	};

    	that.onWin = function (func) {
    		onwin = func;
    	}

    	that.setPlayersName = function (a) {
    		angular.copy(a, who);
    	};

    	that.getPlayersName = function () {
    		return who;
    	};

    	that.getCurrentPlayer = function () {
    		return current / 2;
    	};

    	var erase = function () {
    		for (var i = 0; i < 3; i++) {
    			for (var j = 0; j < 3; j++) {
    				if (that.table[i][j].count) {
    					that.table[i][j].count--;
    				} else {
    					that.table[i][j].text = 1;
    				}
    			}
    		}
    	};

    	var test = function () {
    		var ret = [0, 0, 0, 0, 0, 0, 0, 0];
    		for (var i = 0; i < 3; i++) {
    			for (var j = 0; j < 3; j++) {
    				ret[i] += that.table[i][j].text - 1;
    				ret[3 + i] += that.table[j][i].text - 1;
    				if (i == j) {
    					ret[6] += that.table[i][j].text - 1;
    				}
    				if (i == 2 - j) {
    					ret[7] += that.table[i][j].text - 1;
    				}
    			}
    		}
    		return ret;
    	};

    	var think = function (test) {
    		var lose = [], win = [], ret = parseInt(Math.random() * 9), t;

    		while (that.table[parseInt(ret / 3)][ret % 3].text != 1) {
    			ret = parseInt(Math.random() * 9);
    		}

    		var seek = function (arrIndex) {
    			var check = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]], mem = [];
    			angular.forEach(arrIndex, function (v) {
    				var minc, memindex;
    				for (var i = memindex = 0, minc = 6; i < 3; i++) {
    					var x = check[v][i];
    					var mono = that.table[parseInt(x / 3)][x % 3];
    					if (mono.count < minc) {
    						minc = mono.count;
    					}
    					if (mono.text == 1) {
    						memindex = x;
    					}
    				}
    				mem.push({ count: minc, index: memindex });
    			});
    			mem = mem.sort(function (a, b) {
    				return a.count - b.count;
    			})[0];
    			return mem;
    		};

    		for (var i = 0; i < 8; i++) {
    			var d = test[i];
    			if (d == -2) {
    				lose.push(i);
    			} else if (d == 2) {
    				win.push(i);
    			}
    		}
    		if (lose.length) { ret = seek(lose).index; }
    		if (win.length) { t = seek(win); ret = t.count == 0 ? t.index : ret; }
    		return ret;
    	};

    	that.onclick = function (index) {
    		if (that.table[parseInt(index / 3)][index % 3].count) {
    			return;
    		}
    		that.table[parseInt(index / 3)][index % 3].text = current;
    		that.table[parseInt(index / 3)][index % 3].count = 6;

    		erase();
    		var t = test();
    		if (t.filter(function (d) {
                    return Math.abs(d) == 3;
    		}).length) {
    			onwin();
    			return;
    		}
    		current = (2 - current);
    		that.msg = msgSet();
    		if (that.vsComputer && current == 2) {
    			$timeout(function () { that.onclick(think(t)); }, 600);
    		}
    	};
    })
	.controller("HomeCtrl", function ($scope, Ttt) {
		$scope.start = function (com) {
			myNavigator.pushPage("man2man.html");
			Ttt.init($scope.tr.game, com);
		};
	})
    .controller("TttCtrl", function ($scope, Ttt) {
    	var tr = $scope.tr;
    	$scope.utl = Ttt;

    	$scope.onclick = function (i) {
    		Ttt.onclick(i);
    	};

    	Ttt.onWin(function () {
    		ons.notification.confirm({
    			message: tr.game.continuePrompt,
    			title: Ttt.getPlayersName()[Ttt.getCurrentPlayer()] + tr.game.wins,
    			buttonLabels: tr.game.button,
    			callback: function (index) {
    				switch (index) {
    					case 0:
    						Ttt.init(tr.game, Ttt.vsComputer);
    						$scope.$apply();
    						break;
    					case 1:
    						myNavigator.popPage();
    						break;
    				}
    			}
    		});
    	});
    })