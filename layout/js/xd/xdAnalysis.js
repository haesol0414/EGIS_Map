const clearBtn = document.getElementById('xd-clear-btn');
const selectBtn = document.getElementById('xd-select-btn');
const distanceBtn = document.getElementById('distance-btn');
const areaBtn = document.getElementById('area-btn');
const radiusBtn = document.getElementById('radius-btn');
const altitudeBtn = document.getElementById('altitude-btn');

// 고도 측정 이벤트 핸들러
function altitudeHandler(e) {
	createAltitudePOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
		'rgba(10, 10, 0, 0.5)',
		e.dGroundAltitude, e.dObjectAltitude, false);

	// viewListResult(e);
}

// 거리, 면적, 반경 측정에서 callBackAddPoint()의 콜백 함수
function addPoint(e) {
	const currentState = getMouseState();
	c;	// 마우스 상태가 '거리'일 경우
	if (currentState === 'distance') {
		console.log('거리 측정');
		let partDistance = e.dDistance,
			totalDistance = e.dTotalDistance;

		if (partDistance === 0 && totalDistance === 0) {
			m_objcount = 0;
			createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', 'Start', true);

			return;
		}

		if (e.dDistance > 0.01) {
			createDiscAndAreaPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 255, 0, 0.8)', e.dDistance, false);
		}
		createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', e.dTotalDistance, true);

		return;
	}

	// 마우스 상태가 '면적'일 경우
	if (currentState === 'area') {
		console.log('면적 측정');

		if (e.dArea > 0) {
			createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', `${e.dArea.toFixed(2)}m²`, true);
		}
		return;
	}

	// 마우스 상태가 '반경'일 경우
	if (currentState === 'radius') {
		console.log('반경 addPoint: ', e);

		if (e.dTotalDistance > 0) {
			clearRadiusIcon();

			createRadiusPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 204, 198, 0.8)', e.dTotalDistance, true);
		}
	}
}

// 거리, 면적, (반경) 측정에서 callBackAddPoint()의 콜백 함수
function endPoint(e) {
	console.log('endPoint: ', e);
	viewListOBjKey(e); // UI 목록에 추가

	GLOBAL.m_mercount++; // 작업 카운트 증가
}

// 고도 측정 시 점 그리기
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

// 거리/면적/반경 측정 시 누적 거리 표시 말풍선 이미지 그리기
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

// 거리/고도 측정 시 둥근 사각형 이미지 그리기
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

// 아이콘 생성 함수
function drawIcon(_canvas, _color, _value, _balloonType, _subValue = null) {
	const ctx = _canvas.getContext('2d');
	ctx.clearRect(0, 0, _canvas.width, _canvas.height);

	if (_subValue !== null) {
		// 고도 측정 시
		if (_subValue === -1) {
			drawRoundRect(ctx, 50, 20, 100, 20, 5, _color); // 객체 높이 값이 유효하지 않을 경우
		} else {
			drawRoundRect(ctx, 50, 5, 100, 35, 5, _color);  // 객체 높이 값이 유효할 경우
			setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2,
				'지면고도 : ' + setKilloUnit(_subValue, 0.001, 0),
				'rgb(255, 255, 255)', '12px');
		}

		setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2 + 15,
			'해발고도 : ' + setKilloUnit(_value, 0.001, 0),
			'rgb(255, 255, 255)', '12px');

		// 높이 위치에 점 찍기
		drawDot(ctx, _canvas.width, _canvas.height);
	} else {
		// 그 외
		if (_balloonType) {
			drawBalloon(ctx, _canvas.height * 0.5, _canvas.width, _canvas.height, 5, _canvas.height * 0.25, _color);
			setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2, _value, 'rgb(0, 0, 0)', '16px');
		} else {
			drawRoundRect(ctx, 0, _canvas.height * 0.3, _canvas.width, _canvas.height * 0.25, 5, _color);
			setText(ctx, _canvas.width * 0.5, _canvas.height * 0.5, _value, 'rgb(0, 0, 0)', '16px');
		}
	}

	return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
}

// 고도 측정 결과값을 UI 리스트에 추가
function viewListResult(e) {
	const index = objList.children.length + 1;

	objList.insertAdjacentHTML('afterbegin', createAltiResultHTML(e, index));
}

// 거리/면적 측정에서 오브젝트 key값을 UI 리스트에 추가
function viewListOBjKey(_key) {
	const objList = document.getElementById('xd-object-list');
	const obj = document.createElement('li');

	// li 생성
	obj.id = _key;
	obj.textContent = `· ${_key}`;
	obj.classList.add('xd-object');

	// 삭제 버튼 추가
	const deleteBtn = createDeleteButton(_key);
	obj.appendChild(deleteBtn); // 리스트 항목에 삭제 버튼 추가

	objList.appendChild(obj);   // 리스트에 항목 추가
}

// 전체 측정 초기화
function clearAnalysis() {
	document.querySelectorAll('.map-tool-btn.active').forEach(btn => btn.classList.remove('active'));

	clearRadiusIcon();

	// 측정 관련 객체 초기화
	Module.XDClearDistanceMeasurement();
	Module.XDClearAreaMeasurement();
	Module.XDClearCircleMeasurement();


	// 등록된 아이콘 리스트 삭제
	var i, len, icon, poi;

	// 오브젝트 전체 삭제
	if (POILayer != null) {
		for (i = 0, len = POILayer.getObjectCount(); i < len; i++) {
			poi = POILayer.keyAtObject('POI' + i);
			icon = poi.getIcon();

			// 아이콘을 참조 중인 POI 삭제
			POILayer.removeAtKey('POI' + i);

			// 아이콘을 심볼에서 삭제
			XD.Symbol.deleteIcon(icon.getId());
		}

		POILayer.removeAll();
	}
	if (WallLayer != null) {
		WallLayer.removeAll();
	}


	// li 초기화
	let objList = document.getElementById('xd-object-list');
	while (objList.hasChildNodes()) {
		objList.removeChild(objList.firstChild);
	}

	// 전역 변수 초기화
	GLOBAL.m_mercount = 0;
	GLOBAL.m_objcount = 0;
	GLOBAL.n_index = 0;

	// 화면 렌더링
	Module.XDRenderData();
}


/* ========================= 버튼 이벤트 ============================= */
// 거리 측정 버튼
distanceBtn.addEventListener('click', () => {
	clearAnalysis();

	distanceBtn.classList.add('active');
	if (!switchBtn.checked) switchBtn.click();

	setMouseState('distance'); // 거리 측정 모드

	console.log('거리 측정');
});

// 면적 측정 버튼
areaBtn.addEventListener('click', () => {
	clearAnalysis();
	areaBtn.classList.add('active');
	if (!switchBtn.checked) switchBtn.click();

	setMouseState('area'); // 면적 측정 모드

	console.log('면적 측정');
});

// 고도 측정 버튼
altitudeBtn.addEventListener('click', () => {
	clearAnalysis();
	altitudeBtn.classList.add('active');
	if (!switchBtn.checked) switchBtn.click();

	setMouseState('altitude'); // 고도 측정 모드

	console.log('고도 측정');
});

// 반경 측정 버튼
radiusBtn.addEventListener('click', () => {
	clearAnalysis();
	radiusBtn.classList.add('active');
	if (switchBtn.checked) switchBtn.click();

	setMouseState('radius'); // 반경 측정 모드

	console.log('반경 측정');
});

// 초기화 버튼
clearBtn.addEventListener('click', () => {
	clearAnalysis();

	setMouseState('select');
	console.log('분석 내용 초기화');
});

// 객체 선택 버튼 ==>  레이어 토글로 표시한 후에 토글 켜진 상태에서 선택하면 사용자가 입력한 값으로 저장