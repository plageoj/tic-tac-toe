/** 置かれている石
 * - 0 - 先攻/プレイヤー
 * - 1 - 空白
 * - 2 - 後攻/コンピュータ
 * @typedef TableContent
 * @type {0|1|2} */
/** 盤面のマス
 * @typedef TableCell
 * @property {number} count 石が消えるまでの残りターン数
 * @property {TableContent} content アイテムの種類 */
/** 盤面
 * @typedef Table
 * @type {TableCell[][]} */
/** 勝敗チェック結果
 * @typedef TestResult
 * @type {number[]} */
/** プレイヤー
 * - 0 - 先攻/プレイヤー
 * - 2 - 後攻/コンピュータ
 * @typedef PlayerIndex
 * @type {0|2} */

angular.module("TttService", []).service("Ttt", [
  "$timeout",
  function ($timeout) {
    /** プレイヤー名
     * @type {string[]}
     * @example ["先攻", "後攻"] */
    let who = [];
    let waiting = "";
    /** 現在の手番プレイヤー
     * @type {PlayerIndex} */
    let current = 0;
    /** 勝利時のコールバック
     * @type {()=>void} */
    let winCallback;

    /** どちらのプレイヤーの手番かを示すヒューマンリーダブル文字列を返す */
    const msgSet = () => who[current / 2] + waiting;
    /** 石を示す fontAwesome のアイコン名
     * @type {string[]} */
    this.iconName = ["fa-times", "", "fa-circle-o"];

    /** 勝利時のコールバックを設定
     * @param {()=>void} func*/
    this.onWin = (func) => {
      winCallback = func;
    };

    this.getPlayersName = () => who;
    /** 表示用の手番プレイヤー {0 | 1} */
    this.getCurrentPlayer = () => current / 2;

    /** 石の有効期限を更新し、期限切れの石を盤面から取り除く */
    const erase = () => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.table[i][j].count) {
            this.table[i][j].count--;
          } else {
            this.table[i][j].content = 1;
          }
        }
      }
    };

    /** 行・列・斜めに石が何個あるか数える\
     * お互いの石があるときは相殺して絶対値が小さくなる
     * @returns {TestResult} */
    const test = () => {
      const ret = [0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ret[i] += this.table[i][j].content - 1;
          ret[3 + i] += this.table[j][i].content - 1;
          if (i === j)
            // 右下がり斜めチェック
            ret[6] += this.table[i][j].content - 1;

          if (i === 2 - j)
            // 左下がり斜めチェック
            ret[7] += this.table[i][j].content - 1;
        }
      }
      return ret;
    };

    /** @param {TestResult} test */
    const think = (test) => {
      var lose = [],
        win = [],
        ret = Math.floor(Math.random() * 9),
        t;

      while (this.table[Math.floor(ret / 3)][ret % 3].content !== 1) {
        ret = Math.floor(Math.random() * 9);
      }

      /**
       * @param {Number[]} arrIndex
       * @returns
       */
      const seek = (arrIndex) => {
        const check = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ],
          mem = [];
        angular.forEach(arrIndex, (v) => {
          let minCount = 6,
            memindex = 0;
          for (let i = 0; i < 3; i++) {
            const x = check[v][i];
            const mono = this.table[Math.floor(x / 3)][x % 3];
            if (mono.count < minCount) {
              minCount = mono.count;
            }
            if (mono.content == 1) {
              memindex = x;
            }
          }
          mem.push({ count: minCount, index: memindex });
        });
        return mem.sort((a, b) => a.count - b.count)[0];
      };

      for (let i = 0; i < 8; i++) {
        const d = test[i];
        if (d == -2) {
          lose.push(i);
        } else if (d == 2) {
          win.push(i);
        }
      }
      if (lose.length) {
        ret = seek(lose).index;
      }
      if (win.length) {
        t = seek(win);
        ret = t.count == 0 ? t.index : ret;
      }
      return ret;
    };

    /** @param {TestResult} testResult */
    const processComputer = (testResult) => {
      if (this.vsComputer && current == 2) {
        $timeout(() => {
          this.onclick(think(testResult));
        }, 600);
      }
    };

    /** @param {number} index */
    this.onclick = (index) => {
      if (this.table[Math.floor(index / 3)][index % 3].count) {
        return;
      }
      this.table[Math.floor(index / 3)][index % 3].content = current;
      this.table[Math.floor(index / 3)][index % 3].count = 6;

      erase();
      const testResult = test();
      // 勝利判定
      if (testResult.includes(3) || testResult.includes(-3))
        return winCallback();

      current = current ? 0 : 2;
      this.msg = msgSet();
      processComputer(testResult);
    };

    /** ランダムなプレイヤーを返す
     * @returns {PlayerIndex}
     */
    const getRandomPlayer = () => (Math.random() >= 0.5 ? 0 : 2);

    /** 盤面を初期化
     * @param {*} langObj
     * @param {boolean} com
     */
    this.init = (langObj, com) => {
      current = com ? getRandomPlayer() : 0;
      /** @type {Table} */
      this.table = Array(3)
        .fill(1)
        .map(() =>
          Array(3)
            .fill(1)
            .map(() => ({ count: 0, content: 1 }))
        );

      who = com ? langObj.computer : langObj.players;
      waiting = langObj.phase;
      this.msg = msgSet();

      this.vsComputer = com;
      processComputer(test());
    };
  },
]);
