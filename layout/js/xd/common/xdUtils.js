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


