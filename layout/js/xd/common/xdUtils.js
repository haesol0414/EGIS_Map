// 면적 측정 - 단위 끊어내기
function setTextComma(_str) {
	return _str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

// m/km 텍스트 변환
function setKilloUnit(_text, _meterToKilloRate, _decimalSize) {
	if (_decimalSize < 0) {
		_decimalSize = 0;
	}

	if (typeof _text == 'number') {
		if (_text < 1.0 / (_meterToKilloRate * Math.pow(10, _decimalSize))) {
			_text = _text.toFixed(1).toString() + 'm';
		} else {
			_text = (_text * _meterToKilloRate).toFixed(2).toString() + '㎞';
		}
	}

	return _text;
}

// 반환 받은 값을 텍스트로 그리는 함수
function setText(_ctx, _posX, _posY, _value, _color, _size) {
	const currentState = getMouseState();
	let strText = String(_value);

	// 텍스트 문자열 설정
	if (typeof _value === 'number') {
		strText = setKilloUnit(_value, 0.001, 0);
	}

	if (currentState === 'area') {
		const numValue = parseFloat(_value.replace(/[^0-9.]/g, ''));

		strText = setTextComma(numValue.toFixed(2)) + '㎡';
	}

	// 텍스트 스타일 설정
	_ctx.font = `bold ${_size} sans-serif`;
	_ctx.textAlign = 'center';
	_ctx.fillStyle = _color;

	// 텍스트 그리기
	_ctx.fillText(strText, _posX, _posY);
}

// 현재 마우스 상태 반환 함수
function getMouseState() {
	const mouseState = Module.XDGetMouseState();

	if (mouseState === Module.MML_MOVE_GRAB) {
		return 'move';
	} else if (mouseState === Module.MML_SELECT_POINT) {
		return 'select';
	} else if (mouseState === Module.MML_ANALYS_DISTANCE_STRAIGHT) {
		return 'distance';
	} else if (mouseState === Module.MML_ANALYS_AREA_PLANE) {
		return 'area';
	} else if (mouseState === Module.MML_ANALYS_AREA_CIRCLE) {
		return 'radius';
	} else if (mouseState === Module.MML_ANALYS_ALTITUDE) {
		return 'altitude';
	}
	return 'unknown';
}

// 마우스 상태 설정 함수
function setMouseState(state) {
	switch (state) {
		case 'move':
			Module.XDSetMouseState(Module.MML_MOVE_GRAB); // 이동 모드
			break;
		case 'select':
			Module.XDSetMouseState(Module.MML_SELECT_POINT); // 객체 선택 모드
			break;
		case 'distance':
			Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT); // 거리 측정 모드
			break;
		case 'area':
			Module.XDSetMouseState(Module.MML_ANALYS_AREA_PLANE); // 면적 측정 모드
			break;
		case 'radius':
			Module.XDSetMouseState(Module.MML_ANALYS_AREA_CIRCLE); // 반경 측정 모드
			break;
		case 'altitude':
			Module.XDSetMouseState(Module.MML_ANALYS_ALTITUDE); // 고도 측정 모드
			break;
		default:
			console.warn(`알 수 없는 마우스 상태: ${state}`);
			return;
	}
}

// 측정 버튼 공통 함수 정의
function handleMeasurement(button, mouseState, switchCheck, tilt, limitTilt) {
	clearAnalysis();
	document.querySelectorAll('.map-tool-btn.active').forEach(btn => btn.classList.remove('active'));
	button.classList.add('active');

	// 스위치 버튼 체크 상태에 따라 동작
	if (switchBtn.checked !== switchCheck) switchBtn.click();

	// 카메라 설정
	XD.Camera.setTilt(tilt);
	XD.Camera.setLimitTilt(limitTilt);

	setMouseState(mouseState);
	console.log(`${mouseState} 측정`);
}
