let startPoint = null;
let drawLineMod = false; // 라인 그리기 활성화 여부
let selectedLineType = null;
let lineIndex = 1;


// POI OBJECT 생성 ================================================= *
// 거리 또는 면적 측정 POI 생성
function createDiscAndAreaPOI(_position, _color, _balloonType, _result) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _balloonType, _result);
	const key = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;

	// 면적 측정 시 기존 POI 삭제
	if (getMouseState() === 'area') {
		POILayer.removeAtKey(key);
	}

	const poi = Module.createPoint(key);
	poi.setPosition(_position);            // 위치 설정
	poi.setImage(imageData, drawCanvas.width, drawCanvas.height);

	POILayer.addObject(poi, 0);            // 레이어에 객체 추가

	// 거리 측정 시 객체 카운트 증가
	if (getMouseState() === 'distance') {
		GLOBAL.m_objcount++;
	}

	Module.XDRenderData();                 // 화면 다시 렌더링
}

// 고도 측정 POI 생성
function createAltiPOI(_position, _color, _balloonType, _gAltitude, _oAltitude) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 200;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _balloonType, _gAltitude, _oAltitude);
	let index = GLOBAL.n_index;

	if (XD.Symbol.insertIcon('Icon' + index, imageData, drawCanvas.width, drawCanvas.height)) {
		const icon = XD.Symbol.getIcon('Icon' + index);
		const poi = Module.createPoint('ALTI_POI_' + index);

		poi.setPosition(_position);    // 위치 설정
		poi.setIcon(icon);             // 아이콘 설정

		const objId = poi.getId();
		POILayer.addObject(poi, 0);    // 레이어에 객체 추가

		GLOBAL.n_index++;               // 인덱스 증가
		addObjectKeyToList(POILayer, objId, 'xd-object-list');
	}
}

// 전역변수에 반경 icon 이름 저장
let radiusIconNm = '';

// 반경 측정 POI 생성
function createRadiusPOI(_position, _color, _balloonType, _totalRadius) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _balloonType, _totalRadius);

	let createIconNm = 'Icon_' + _totalRadius;
	if (!XD.Symbol.getIcon(createIconNm)) {
		// 기존의 Icon은 삭제
		XD.Symbol.deleteIcon(radiusIconNm);

		// 새 Icon 그리기
		XD.Symbol.insertIcon(createIconNm, imageData, drawCanvas.width, drawCanvas.height);
		radiusIconNm = createIconNm;
	}

	let icon = XD.Symbol.getIcon(createIconNm);
	let poi = Module.createPoint('RADI_POI_' + _totalRadius.toFixed(1));
	let objId = poi.getId();

	poi.setPosition(_position);     // 위치 설정
	poi.setIcon(icon);              // 아이콘 설정
	POILayer.addObject(poi, 0);     // 레이어에 오브젝트 추가

	addObjectKeyToList(POILayer, objId, 'xd-object-list');
}

// 오브젝트 개별 삭제
function clearObjectByKey(_layer, _key) {
	const currentState = getMouseState();

	if (_layer === POILayer) {
		let list = POILayer.getObjectKeyList();
		let strlist = list.split(',');

		strlist.forEach((item) => {
			if (currentState === 'altitude' || currentState === 'select') {
				// 고도 측정일 경우 단순 포함 여부로 검사
				if (item.includes(_key.match(/\d+/g)?.[0])) {
					POILayer.removeAtKey(item);
				}
			} else {
				// 나머지 경우 startsWith로 매칭
				let poiKeyPattern = `${_key.match(/\d+/g)?.[0]}_`;
				if (item.startsWith(poiKeyPattern)) {
					POILayer.removeAtKey(item);
				}
			}
		});
		document.getElementById(_key).remove();
	} else if (_layer === LineLayer) {
		// LineLayer에서 객체 제거
		let list = LineLayer.getObjectKeyList(); // 라인 레이어의 모든 오브젝트 키 가져오기
		let strlist = list.split(',');

		strlist.forEach((item) => {
			if (item === _key) {
				LineLayer.removeAtKey(item); // 매칭된 키로 라인 객체 제거
			}
		});
		document.getElementById(_key).remove();
	} else {
		console.warn('레이어를 찾을 수 없음');
	}

	if (currentState === 'distance' || currentState === 'select') {
		Module.XDClearDistanceObject(_key); // 거리 객체 삭제
	} else if (currentState === 'area') {
		Module.XDClearAreaObject(_key); // 면적 객체 삭제
	} else if (currentState === 'radius' || currentState === 'select') {
		console.log('??');
		if (POILayer !== null) {
			POILayer.removeAll();
		}
		if (WallLayer !== null) {
			WallLayer.removeAll();
		}
		Module.XDClearCircleMeasurement(); // 반경 객체 삭제
	}

	Module.XDRenderData(); // 화면 다시 렌더링
}


// 라인 OBJECT ================================================= *
function createLine(_objKey, _coordinate, _type) {
	// 라인 오브젝트 이름
	let lineObj = Module.createLineString(_objKey);
	let lineOption = null;

	// 라인 위치
	const coordinates = {
		coordinate: _coordinate,
		style: 'XYZ'
	};

	if (_type === 0) lineOption = createNormalLineJson(coordinates); 	// 0 : 실선
	else if (_type === 1) lineOption = createArrowLineJson(coordinates);	// 1 : 화살표
	else if (_type === 2) lineOption = createDashLineJson(coordinates);		// 2 : 점선

	// 라인 형태 및 속성 지정
	lineObj.createbyJson(lineOption);

	LineLayer.addObject(lineObj, 0);
	console.log('라인생성');

	addObjectKeyToList(LineLayer, _objKey, 'line-obj-list');
}


/* ========================= 이벤트 리스너 ============================= */
const container = document.querySelector('#add-line');
const lineTypeBtns = container.querySelectorAll('input[name="lineType"]');

// 라인 초기화 버튼
clearLineBtn.addEventListener('click', function() {
	clearLineLayer();
});

// 라인 생성 버튼
drawLineBtn.addEventListener('click', function() {
	if (!selectedLineType) {
		alert('라인 타입을 선택하세요.');
		return;
	}

	drawLineBtn.disabled = true; // 버튼 비활성화
	drawLineMod = false; 		 // 라인 그리기 모드 종료

	selectedLineType = null; 	 // 라인 타입 초기화
	// 라디오 버튼 체크 해제
	lineTypeBtns.forEach((radio) => {
		radio.checked = false;
	});
});

// 라디오 버튼 체인지 이벤트 등록 및 처리
lineTypeBtns.forEach((radio) => {
	radio.addEventListener('change', (e) => {
		selectedLineType = e.target.value;
		drawLineBtn.disabled = false; // 라인 그리기 버튼 활성화
		drawLineMod = true; // 라인 그리기 모드 활성화

		console.log(`Selected line type: ${selectedLineType}`);
	});
});

// 클릭된 좌표로 라인 생성
mapDiv.addEventListener('click', function() {
	if (!drawLineMod) return; // 라인 그리기 모드가 아니면 종료

	// 클릭된 위치 가져오기
	let [longitude, latitude, altitude] = Module.GetClickPosition().split('_').map(parseFloat);

	if (!startPoint) {
		startPoint = [longitude, latitude, altitude];
		// console.log('시작점이 설정되었습니다. = ', startPoint);
	} else {
		let endPoint = [longitude, latitude, altitude];
		// console.log('종료지점이 설정되었습니다. = ', endPoint);

		// 라인 좌표 생성
		let coordinates = [startPoint, endPoint];
		console.log(coordinates);

		// 고유한 오브젝트 키 생성
		let objKey = 'LINE_' + lineIndex;
		lineIndex++;

		// 라인 생성 함수 호출
		createLine(objKey, coordinates, parseInt(selectedLineType));

		// 시작점 초기화
		startPoint = null;
	}
});
