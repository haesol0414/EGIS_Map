// 점 그리기
function drawDot(_ctx, _width, _height) {
	_ctx.beginPath();
	_ctx.lineWidth = 6;
	_ctx.arc(_width * 0.5, _height * 0.5, 2, 0, 2 * Math.PI, false);
	_ctx.closePath();

	_ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
	_ctx.fill();
	_ctx.lineWidth = 8;
	_ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
	_ctx.stroke();
}

// 누적 거리 표시 말풍선 이미지 그리기
function drawBalloon(_ctx, _marginBottom, _width, _height, _barWidth, _barHeight, _color) {
	const wCenter = _width * 0.5;

	_ctx.beginPath();
	_ctx.moveTo(0, 0);
	_ctx.lineTo(0, _height - _barHeight - _marginBottom);
	_ctx.lineTo(wCenter - _barWidth, _height - _barHeight - _marginBottom);
	_ctx.lineTo(wCenter, _height - _marginBottom);
	_ctx.lineTo(wCenter + _barWidth, _height - _barHeight - _marginBottom);
	_ctx.lineTo(_width, _height - _barHeight - _marginBottom);
	_ctx.lineTo(_width, 0);
	_ctx.closePath();

	_ctx.fillStyle = _color;
	_ctx.fill();
}

// 둥근 사각형 배경 그리기
function drawRoundRect(_ctx, _x, _y, _width, _height, _radius, _color) {
	if (_width < 2 * _radius) _radius = _width * 0.5;
	if (_height < 2 * _radius) _radius = _height * 0.5;

	_ctx.beginPath();
	_ctx.moveTo(_x + _radius, _y);
	_ctx.arcTo(_x + _width, _y, _x + _width, _y + _height, _radius);
	_ctx.arcTo(_x + _width, _y + _height, _x, _y + _height, _radius);
	_ctx.arcTo(_x, _y + _height, _x, _y, _radius);
	_ctx.arcTo(_x, _y, _x + _width, _y, _radius);
	_ctx.closePath();

	_ctx.fillStyle = _color;
	_ctx.fill();
}

// 일반 라인
function createNormalLineJson(_coordinates) {
	let lineOption = {
		coordinates: _coordinates,
		type: 0,                                        // 실선 생성
		union: true,                                    // 지형 결합 상태
		depth: false,                                   // 객체 겹침 상태
		color: new Module.JSColor(255, 0, 0, 255),      // ARGB
		width: 5		                                // 선 두께
	};

	return lineOption;
}

// 화살표 라인
function createArrowLineJson(_coordinates) {
	console.log('arrow : ', _coordinates);

	let lineOption = {
		coordinates: _coordinates,
		type: 3,                                        // 화살표 선 생성
		union: true,                                    // 지형 결합 상태
		depth: false,                                   // 객체 겹침 상태
		color: new Module.JSColor(255, 255, 0, 0),      // ARGB
		width: 8                                        // 선 두께 (type 3에 대해 1로 설정 시 화살표가 그려지지 않음)
	};

	return lineOption;
}

// 점선
function createDashLineJson(_coordinates) {
	let lineOption = {
		coordinates: _coordinates,
		type: 4,                                   		 // 점선 생성
		union: false,                              		// 지형 결합 상태
		depth: false,                              		// 지형 겹침: 없음
		color: new Module.JSColor(255, 255, 0, 255),     // ARGB
		width: 5,                              			// 선 두께
		dash: 20                                		// 점선 간격 (0)
	};

	return lineOption;
}
