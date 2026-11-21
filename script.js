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
    vx: 60,
    vy: -500
};

// バー
const paddle = {
    x: 195,
    y: 580,
    width: 90,
    height: 12
};

// 敵
const enemy = {
    x: (canvas.width - 64) / 2,
    y: (canvas.height - 32) / 2,
    width: 64,
    height: 32,

    hp: 3,
    maxHp: 3,

    active: true
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

// リスタート
function restart() {
    ball.x = 240;
    ball.y = 500;
    ball.vx = 60;
    ball.vy = -500;

    // 敵を復活させてHPを最大に戻す
    enemy.hp = enemy.maxHp;
    enemy.active = true;

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

    // 敵との衝突判定
    if (
        enemy.active &&
        ball.x + ball.radius > enemy.x &&
        ball.x - ball.radius < enemy.x + enemy.width &&
        ball.y + ball.radius > enemy.y &&
        ball.y - ball.radius < enemy.y + enemy.height
    ) {
        // 敵のHPを1減らす
        enemy.hp -= 1;

        // ボールを敵の外に戻して跳ね返す
        if (ball.vy < 0) {
            ball.y = enemy.y + enemy.height + ball.radius;
        } else {
            ball.y = enemy.y - ball.radius;
        }

        ball.vy *= -1;

        // HPが0になったら敵を消す
        if (enemy.hp <= 0) {
            enemy.hp = 0;
            enemy.active = false;
        }
    }
}

// ゲーム画面を描画する
function draw() {

    // 画面を消去
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 敵を描画
    if (enemy.active) {

        if (enemyImage.complete && enemyImage.naturalWidth > 0) {
            ctx.drawImage(
                enemyImage,
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );
        }

        // 敵のHPを表示
        ctx.fillStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(
            "HP: " + enemy.hp,
            canvas.width / 2,
            enemy.y - 8
        );
    }

    // ボールを描画
    ctx.fillStyle = "#000000";

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
