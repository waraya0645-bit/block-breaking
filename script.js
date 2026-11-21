// Canvasを取得
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ボール
const ball = {
    x: 240,
    y: 500,
    radius: 8
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


// ゲームループ
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();
