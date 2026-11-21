// Canvasを取得
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ボール
const ball = {
    x: 240,
    y: 500,
    radius: 8,

    vx: 80,
    vy: -180
};

// バー
const paddle = {
    x: 195,
    y: 580,
    width: 90,
    height: 12
};

// ブロック
const bricks = [];

const brickRows = 4;
const brickColumns = 7;

const brickWidth = 55;
const brickHeight = 18;
const brickGap = 8;

for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < brickColumns; col++) {
        bricks.push({
            x: 22 + col * (brickWidth + brickGap),
            y: 70 + row * (brickHeight + brickGap),
            width: brickWidth,
            height: brickHeight
        });
    }
}

// ゲームの状態を更新する
function update(delta) {

    const seconds = delta / 1000;

    // ボールの位置を更新
    ball.x += ball.vx * seconds;
    ball.y += ball.vy * seconds;

    // 左の壁
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -1;
    }

    // 右の壁
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -1;
    }

    // 上の壁
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }

    // バーとの衝突判定
    if (
        ball.vy > 0 &&
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius < paddle.y &&
        ball.x + ball.radius >= paddle.x &&
        ball.x - ball.radius <= paddle.x + paddle.width
    ) {
        // ボールの位置をバーの上に戻す
        ball.y = paddle.y - ball.radius;

        // 上方向に跳ね返す
        ball.vy *= -1;
    }
}
// ゲーム画面を描画する
function draw() {

    // 画面を消去
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ブロックを描画
    ctx.fillStyle = "#E65D5D";

    for (const brick of bricks) {
        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );
    }

    // ボールを描画
    ctx.fillStyle = "#FFFFFF";

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // バーを描画
    ctx.fillStyle = "#5B9BE6";

    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );
}

// 前回の実行時刻
let previousTime = 0;

// ゲームループ
function gameLoop(currentTime) {

    // 前回からの経過時間
    const delta = previousTime === 0
        ? 0
        : currentTime - previousTime;

    previousTime = currentTime;

    // ゲームの更新
    update(delta);

    // 画面の描画
    draw();

    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop(0);
