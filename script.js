// =========================
// カード定義
// =========================
const marks = ["♠", "♥", "♦", "♣"];

const nums = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

// =========================
// ゲーム状態
// =========================
let cards = [];
let open = [];

let first = -1;
let second = -1;

let turn = 0;

let playerName = "";

// ランキング二重送信防止
let scoreSent = false;

// =========================
// DOM
// =========================
const gameTable  = document.getElementById("gameTable");
const turnText   = document.getElementById("turn");
const clearText  = document.getElementById("clearText");
const playerText = document.getElementById("playerName");

// =========================
// 起動
// =========================
window.onload = () => {

    // プレイヤー名取得
    playerName = getPlayerName();

    // 表示
    playerText.textContent = playerName;

    // CLEAR非表示
    clearText.style.display = "none";

    // ゲーム開始
    initGame();

    // ランキング取得
    loadRanking();
};

// =========================
// プレイヤー名取得
// =========================
function getPlayerName() {

    return localStorage.getItem("playerName")
        || "Guest";
}
// =========================
// ゲーム初期化
// =========================
function initGame() {

    cards = [];

    // カード生成
    for (let n of nums) {

        for (let m of marks) {

            cards.push(n + m);
        }
    }

    // JOKER追加
    cards.push("JOKER");
    cards.push("JOKER");

    // シャッフル
    cards.sort(() => Math.random() - 0.5);

    // 開閉状態
    open = new Array(cards.length).fill(false);

    // 状態リセット
    first = -1;
    second = -1;

    turn = 0;

    scoreSent = false;

    clearText.style.display = "none";

    // 描画
    render();
}

// =========================
// 描画
// =========================
function render() {

    gameTable.innerHTML = "";

    const col = 9;

    let row;

    for (let i = 0; i < cards.length; i++) {

        // 行開始
        if (i % col === 0) {

            row = document.createElement("tr");

            gameTable.appendChild(row);
        }

        const td = document.createElement("td");

        // 開いている
        if (open[i]) {

            const div = document.createElement("div");

            div.className =
                "open-card " + getColor(cards[i]);

            div.textContent = cards[i];

            td.appendChild(div);

        } else {

            // 閉じている
            const btn = document.createElement("button");

            btn.className = "card-button";

            btn.textContent = "?";

            btn.onclick = () => onCardClick(i);

            td.appendChild(btn);
        }

        row.appendChild(td);
    }

    // ターン表示
    turnText.textContent = turn;

    // クリア判定
    if (isClear()) {

        clearText.style.display = "block";

        // 二重送信防止
        if (!scoreSent) {

            scoreSent = true;

            saveScore();
        }
    }
}

// =========================
// カードクリック
// =========================
function onCardClick(index) {

    // 開いていたら無効
    if (open[index]) return;

    // 前回2枚判定
    if (first !== -1 && second !== -1) {

        checkPair();
    }

    // 開く
    open[index] = true;

    // 1枚目
    if (first === -1) {

        first = index;

    } else {

        // 同じカード防止
        if (first === index) return;

        // 2枚目
        second = index;

        // ターン加算
        turn++;
    }

    render();
}

// =========================
// ペア確認
// =========================
function checkPair() {

    const c1 = cards[first];
    const c2 = cards[second];

    // 不一致なら閉じる
    if (!isPair(c1, c2)) {

        open[first] = false;
        open[second] = false;
    }

    first = -1;
    second = -1;
}

// =========================
// ペア判定
// =========================
function isPair(c1, c2) {

    // JOKERペア
    if (c1 === "JOKER" && c2 === "JOKER") {

        return true;
    }

    // 片方だけJOKER
    if (c1 === "JOKER" || c2 === "JOKER") {

        return false;
    }

    // 数字比較
    return extractNumber(c1)
        === extractNumber(c2);
}

// =========================
// 数字抽出
// =========================
function extractNumber(card) {

    return card
        .replace("♠", "")
        .replace("♥", "")
        .replace("♦", "")
        .replace("♣", "");
}

// =========================
// クリア判定
// =========================
function isClear() {

    return open.every(v => v);
}

// =========================
// 色分け
// =========================
function getColor(card) {

    if (
        card.includes("♥")
        || card.includes("♦")
    ) {
        return "red";
    }

    if (card === "JOKER") {

        return "green";
    }

    return "black";
}

// =========================
// スコア保存(ローカル)
// =========================
function saveScore() {

    let ranking =
        JSON.parse(
            localStorage.getItem("ranking")
        ) || [];

    ranking.push({
        name: playerName,
        turn: turn
    });

    ranking.sort(
        (a, b) => a.turn - b.turn
    );

    ranking = ranking.slice(0, 10);

    localStorage.setItem(
        "ranking",
        JSON.stringify(ranking)
    );

    loadRanking();
}
// =========================
// 個人ランキング取得
// =========================
function loadRanking() {

    const body =
        document.getElementById("rankingBody");

    if (!body) return;

    body.innerHTML = "";

    const ranking =
        JSON.parse(
            localStorage.getItem("ranking")
        ) || [];

    ranking.forEach((item, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.turn}</td>
        `;

        body.appendChild(row);
    });
}
// =========================
// リスタート
// =========================
function restartGame() {

    initGame();
}