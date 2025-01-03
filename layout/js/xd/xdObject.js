// 아이콘 이미지 생성 함수
function drawIcon(canvas, color, value, balloonType) {
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 아이콘 형태에 따라 그리기
    if (balloonType) {
        drawBalloon(ctx, canvas.height * 0.5, canvas.width, canvas.height, 5, canvas.height * 0.25, color);
        setText(ctx, canvas.width * 0.5, canvas.height * 0.2, value);
    } else {
        drawRoundRect(ctx, 0, canvas.height * 0.3, canvas.width, canvas.height * 0.25, 5, color);
        setText(ctx, canvas.width * 0.5, canvas.height * 0.5, value);
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

// 말풍선 형태의 배경 그리기
function drawBalloon(ctx, marginBottom, width, height, barWidth, barHeight, color) {
    const wCenter = width * 0.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height - barHeight - marginBottom);
    ctx.lineTo(wCenter - barWidth, height - barHeight - marginBottom);
    ctx.lineTo(wCenter, height - marginBottom);
    ctx.lineTo(wCenter + barWidth, height - barHeight - marginBottom);
    ctx.lineTo(width, height - barHeight - marginBottom);
    ctx.lineTo(width, 0);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
}

// 둥근 사각형 배경 그리기
function drawRoundRect(ctx, x, y, width, height, radius, color) {
    if (width < 2 * radius) radius = width * 0.5;
    if (height < 2 * radius) radius = height * 0.5;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
}

// 텍스트 설정
function setText(ctx, x, y, value) {
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(value, x, y);
}