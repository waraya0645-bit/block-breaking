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

// 2本指バー
const paddle = {
    thickness: 12
};

// 押されている指の位置を保存する
// pointerIdをキーにして、最大2本まで管理する
const activePointers = new Map();

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

// ポインターの画面座標をCanvas内部の座標に変換する
function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

// 指を置いたとき
canvas.addEventListener("pointerdown", (event) => {
    // 画面をタップしたらリスタート
    if (isGameOver) {
        restart();
    }

    // すでに2本の指を管理している場合は追加しない
    if (activePointers.size >= 2) return;

    canvas.setPointerCapture(event.pointerId);

    activePointers.set(
        event.pointerId,
        getCanvasPosition(event)
    );
});

// 指を動かしたとき
canvas.addEventListener("pointermove", (event) => {
    // 管理している指だけ位置を更新する
    if (!activePointers.has(event.pointerId)) return;

    activePointers.set(
        event.pointerId,
        getCanvasPosition(event)
    );
});

// 指を離したとき
function removePointer(event) {
    activePointers.delete(event.pointerId);
}

canvas.addEventListener("pointerup", removePointer);
canvas.addEventListener("pointercancel", removePointer);
canvas.addEventListener("lostpointercapture", removePointer);

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

// ボールと2本指バーの衝突処理
function collideBallWithPaddle(ball, A, B, paddleThickness) {

    // ① バーの方向ベクトル
    const abX = B.x - A.x;
    const abY = B.y - A.y;

    const lengthSquared = abX * abX + abY * abY;

    // バーの長さが0なら処理しない
    if (lengthSquared === 0) return;


    // ② ボールの中心からバーの始点へのベクトル
    const acX = ball.x - A.x;
    const acY = ball.y - A.y;

    // ③ 内積から最近点の位置を求める
    const dot = acX * abX + acY * abY;

    const t = Math.max(0, Math.min(1, dot / lengthSquared));

    // ④ バー上の最近点
    const closestX = A.x + t * abX;
    const closestY = A.y + t * abY;

    // ⑤ 最近点からボールの中心へのベクトル
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // ⑥ 接触しているか判定
    const requiredDistance = ball.radius + paddleThickness / 2;

    if (distance > requiredDistance) return;

    // ⑦ 単位法線ベクトル
    let nx;
    let ny;

    if (distance > 0) {
        nx = dx / distance;
        ny = dy / distance;
    } else {
        // 距離が0なら、バーに垂直な方向を使う
        const length = Math.sqrt(lengthSquared);
        nx = -abY / length;
        ny = abX / length;

        // 法線がボールの進行方向を向いていたら反転する
        const directionDot = ball.vx * nx + ball.vy * ny;

        if (directionDot > 0) {
            nx = -nx;
            ny = -ny;
        }
    }

    // ⑧ めり込みを解消する
    const pushDistance = requiredDistance - distance;

    ball.x += nx * pushDistance;
    ball.y += ny * pushDistance;

    // ⑨ 速度と法線の内積
    const velocityDot = ball.vx * nx + ball.vy * ny;

    // ⑩ バーに向かっている場合だけ反射する
    if (velocityDot < 0) {
        ball.vx -= 2 * velocityDot * nx;
        ball.vy -= 2 * velocityDot * ny;
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

    // 2本の指が置かれている場合だけバーとの衝突判定を行う
    if (activePointers.size === 2) {
        const points = Array.from(activePointers.values());

        collideBallWithPaddle(
            ball,
            points[0],
            points[1],
            paddle.thickness
        );
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

    // 2本の指を結ぶバーを描画
    if (activePointers.size === 2) {
        const points = Array.from(activePointers.values());

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = paddle.thickness;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
    }

    // ゲームオーバー表示
    if (isGameOver) {
        ctx.fillStyle = "#000000";
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
