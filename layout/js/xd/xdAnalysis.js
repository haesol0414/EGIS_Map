const clearBtn = document.getElementById('xd-clear-btn');
const distanceBtn = document.getElementById('distance-btn');
const areaBtn = document.getElementById('area-btn');
const radiusBtn = document.getElementById('radius-btn');
const altitudeBtn = document.getElementById('altitude-btn');
const selectBtn = document.getElementById('xd-select-btn');
const saveBtn = document.getElementById('save-btn');

// 고도 측정 이벤트 핸들러
function altitudeHandler(e) {
	createAltiPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
		'rgba(10, 10, 0, 0.5)', false,
		e.dGroundAltitude, e.dObjectAltitude);
}

// 객체 선택 이벤트 핸들러
function selectHandler(e) {
	const idInput = document.getElementById('obj-id');
	const nameInput = document.getElementById('obj-name');
	const descriptionInput = document.getElementById('obj-description');

	const layerList = new Module.JSLayerList(true);
	const targetLayerName = layerList.nameAtLayer(e.layerName);
	const obj = targetLayerName.keyAtObject(e.objKey);


	if(obj !== null) {
		createDetailPopup(obj.getId(), obj.getName(), obj.getDescription());

		idInput.value = obj.getId();
		nameInput.value = obj.getName();
		descriptionInput.value = obj.getDescription();
	}

	// 저장 버튼
	saveBtn.onclick = function() {

		if (nameInput.value === '') {
			alert('오브젝트 이름을 입력해주세요.');

			return;
		}

		obj.setName(nameInput.value);
		obj.setDescription(descriptionInput.value);

		alert('저장되었습니다.');

		createDetailPopup(obj.getId(), obj.getName(), obj.getDescription());
	};
}

// 거리, 면적, 반경 측정에서 callBackAddPoint()의 콜백 함수
function addPoint(e) {
	const currentState = getMouseState();
	// 마우스 상태가 '거리'일 경우
	if (currentState === 'distance') {
		console.log('거리 측정');
		let partDistance = e.dDistance,
			totalDistance = e.dTotalDistance;

		if (partDistance === 0 && totalDistance === 0) {
			m_objcount = 0;
			createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', true, 'Start');

			return;
		}

		if (e.dDistance > 0.01) {
			createDiscAndAreaPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 255, 0, 0.8)', false, e.dDistance);
		}
		createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', true, e.dTotalDistance);

		return;
	}

	// 마우스 상태가 '면적'일 경우
	if (currentState === 'area') {
		console.log('면적 측정');

		if (e.dArea > 0) {
			createDiscAndAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', true, `${e.dArea.toFixed(2)}m²`);
		}
		return;
	}

	// 마우스 상태가 '반경'일 경우
	if (currentState === 'radius') {
		console.log('반경 addPoint: ', e);

		if (e.dTotalDistance > 0) {
			createRadiusPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 204, 198, 0.8)', true, e.dTotalDistance);
		}
	}
}

// 거리, 면적 측정에서 callBackAddPoint()의 콜백 함수
function endPoint(e) {
	console.log('endPoint: ', e);
	addObjectKeyToList(e); // UI 목록에 추가

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

// 거리/고도 측정 시 둥근 사각형 배경 그리기
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

// 아이콘 생성 함수
function drawIcon(_canvas, _color, _balloonType, _value, _subValue = null) {
	const ctx = _canvas.getContext('2d');
	ctx.clearRect(0, 0, _canvas.width, _canvas.height);

	// 고도 측정 시
	if (_subValue !== null) {
		if (_subValue < 0.01) {
			drawRoundRect(ctx, 50, 20, 100, 20, 5, _color); // 객체 높이 값이 유효하지 않을 경우
		} else if (_subValue > 0) {
			console.log('현재 _subValue 값:', _subValue);
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

// 전체 측정 초기화
function clearAnalysis() {
	document.querySelectorAll('.map-tool-btn.active').forEach(btn => btn.classList.remove('active'));

	// 측정 관련 객체 초기화
	Module.XDClearDistanceMeasurement();
	Module.XDClearAreaMeasurement();
	Module.XDClearCircleMeasurement();
	clearRadiusIcon();

	// li 초기화
	let objList = document.getElementById('xd-object-list');
	while (objList.hasChildNodes()) {
		objList.removeChild(objList.firstChild);
	}

	// 전역 변수 초기화
	GLOBAL.m_mercount = 0;
	GLOBAL.m_objcount = 0;

	// 화면 렌더링
	Module.XDRenderData();
}



/* ========================= 버튼 이벤트 ============================= */
// 측정 버튼 이벤트 등록
// ==> 버튼, 마우스상태, 건물 레이어 상태, 각도, 제한 각도
distanceBtn.addEventListener('click', () => handleMeasurement(distanceBtn, 'distance', false, 30, 10));

areaBtn.addEventListener('click', () => handleMeasurement(areaBtn, 'area', false, 30, 10));

altitudeBtn.addEventListener('click', () => handleMeasurement(altitudeBtn, 'altitude', true, 30, 10));

radiusBtn.addEventListener('click', () => handleMeasurement(radiusBtn, 'radius', false, 90, 90));

// 초기화 버튼
clearBtn.addEventListener('click', () => {
	clearAnalysis();
	setMouseState('move');

	console.log('분석 내용 초기화');
});

// 객체 선택 버튼
selectBtn.addEventListener('click', () => {
	setMouseState('select');

	console.log('객체선택 마우스 상태 변경');
});