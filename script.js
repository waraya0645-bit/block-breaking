// Canvasを取得
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// 敵の画像
const enemyImage = new Image();
enemyImage.src = "./images/dotpict_20261121_173152.png";

// ボール
const ball = {
    x: 240,
    y: 500,
    radius: 8,

    vx: 180,
    vy: -500
};

// バー
const paddle = {
    x: 195,
    y: 580,
    width: 90,
    height: 12
};

// ゲームオーバー状態
let isGameOver = false;
// バーを操作する
function movePaddle(event) {

    // Canvasの表示位置と大きさを取得
    const rect = canvas.getBoundingClientRect();

    // 表示サイズとCanvas内部のサイズの比率
    const scaleX = canvas.width / rect.width;

    // ポインターの位置をCanvas内の座標に変換
    const pointerX = (event.clientX - rect.left) * scaleX;

    // バーの中心をポインターに合わせる
    paddle.x = pointerX - paddle.width / 2;

    // バーが画面外に出ないようにする
    paddle.x = Math.max(
        0,
        Math.min(canvas.width - paddle.width, paddle.x)
    );
}

function restart() {
    ball.x = 240;
    ball.y = 500;
    ball.vx = 180;
    ball.vy = -500;
    for (const brick of bricks) {
    brick.active = true;
    }
    isGameOver = false;
}
// 指やマウスを押したとき
canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    movePaddle(event);
    
    if (isGameOver) {
        restart();
    }
});

// 指やマウスを動かしたとき
canvas.addEventListener("pointermove", movePaddle);

// 敵
const enemies = [];

const enemyRows = 4;
const enemyColumns = 7;

const enemyWidth = 55;
const enemyHeight = 27.5;
const enemyGapX = 8;
const enemyGapY = 12;

const startX = (
    canvas.width -
    (enemyColumns * enemyWidth + (enemyColumns - 1) * enemyGapX)
) / 2;

const startY = 80;

for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyColumns; col++) {
        enemies.push({
            x: startX + col * (enemyWidth + enemyGapX),
            y: startY + row * (enemyHeight + enemyGapY),
            width: enemyWidth,
            height: enemyHeight,

            hp: 3,
            maxHp: 3,

            active: true
        });
    }
}

// ゲームの状態を更新する
function update(delta) {

    // ゲームオーバーなら更新しない
    if (isGameOver) return;

    const seconds = delta / 1000;

    // ボールの位置を更新
    ball.x += ball.vx * seconds;
    ball.y += ball.vy * seconds;

    // ボールが画面の下に落ちたか
    if (ball.y - ball.radius > canvas.height) {
        isGameOver = true;
        return;
    }

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
    // ブロックとの衝突判定
for (const brick of bricks) {

    if (!brick.active) continue;

    // ボールとブロックが重なっているか
    if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
    ) {

        // ブロックを消す
        brick.active = false;

        // ボールを跳ね返す
        ball.vy *= -1;

        // 1回の更新で複数のブロックに当たらないようにする
        break;
    }
}
}
// ゲーム画面を描画する
function draw() {

    // 画面を消去
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ブロックを描画
ctx.fillStyle = "#E65D5D";

for (const brick of bricks) {
    if (!brick.active) continue;

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

    // ゲームオーバー表示
    if (isGameOver) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );
    }
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
