const objList = document.getElementById('xd-object-list');

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
	console.log('ㅇㅇ');
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 200;
	drawCanvas.height = 100;

	console.log('Ground Altitude:', _gAltitude);
	console.log('Object Altitude:', _oAltitude);

	const imageData = drawIcon(drawCanvas, _color, _balloonType, _gAltitude, _oAltitude);
	let index = GLOBAL.n_index;

	if (XD.Symbol.insertIcon('Icon' + index, imageData, drawCanvas.width, drawCanvas.height)) {
		const icon = XD.Symbol.getIcon('Icon' + index);

		let poi = Module.createPoint('POI' + index);

		poi.setPosition(_position);    // 위치 설정
		poi.setIcon(icon);             // 아이콘 설정

		POILayer.addObject(poi, 0);    // 레이어에 객체 추가

		GLOBAL.n_index++;               // 인덱스 증가
	}
}

// 전역변수에 반경 icon 이름 저장
let radiusIconNm = '';
// 반경 측정 POI 생성
function createRadiusPOI(_position, _color, _balloonType, _totalDistance) {
	clearRadiusIcon();

	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _balloonType, _totalDistance);

	let createIconNm = 'Icon_' + _totalDistance;
	if (!XD.Symbol.getIcon(createIconNm)) {
		// 기존의 Icon은 삭제
		XD.Symbol.deleteIcon(radiusIconNm);

		// 새 Icon 그리기
		XD.Symbol.insertIcon(createIconNm, imageData, drawCanvas.width, drawCanvas.height);
		radiusIconNm = createIconNm;
	}

	let icon = XD.Symbol.getIcon(createIconNm);
	let poi = Module.createPoint('POI');
	let objId = poi.getId();

	poi.setPosition(_position);     // 위치 설정
	poi.setIcon(icon);              // 아이콘 설정
	POILayer.addObject(poi, 0);     // 레이어에 오브젝트 추가

	addObjectKeyToList(objId, _totalDistance.toFixed(1));
}

// 오브젝트 개별 삭제
function clearObject(_key) {
	const currentState = getMouseState();

	if (POILayer) {
		let list = POILayer.getObjectKeyList();
		let poiKeyPattern = `${_key.match(/\d+/g)?.[0]}_`;

		// 레이어의 키와 매칭하여 삭제
		let strlist = list.split(',');
		strlist.forEach((item) => {
			if (item.startsWith(poiKeyPattern)) {
				POILayer.removeAtKey(item);
				console.log('오브젝트 삭제:', item);
			}
		});

		document.getElementById(_key).remove();
	} else {
		console.warn('POI 레이어를 찾을 수 없음');
	}

	if (currentState === 'distance') {
		Module.XDClearDistanceObject(_key); // 거리 객체 삭제
	} else if (currentState === 'area') {
		Module.XDClearAreaObject(_key);     // 면적 객체 삭제
	} else if (currentState === 'radius') {
		console.log('??');
		if (POILayer !== null) {
			console.log('?????');

			POILayer.removeAll();
		}
		if (WallLayer !== null) {
			WallLayer.removeAll();
		}
		Module.XDClearCircleMeasurement(); 	// 반경 객체 삭제
	}

	Module.XDRenderData(); // 화면 다시 렌더링
}

// 반경 측정 - 아이콘 삭제
function clearRadiusIcon() {
	if (POILayer !== null) {
		POILayer.removeAll();

	}
	if (WallLayer !== null) {
		WallLayer.removeAll();
	}

	// li 초기화
	let objList = document.getElementById('xd-object-list');
	while (objList.hasChildNodes()) {
		objList.removeChild(objList.firstChild);
	}
}
