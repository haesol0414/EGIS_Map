/* 거리 또는 면적 측정 POI 생성 함수 */
function createDiscAndAreaPOI(_position, _color, _value, _balloonType) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _value, _balloonType);
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

/* 고도 측정 POI 생성 함수 */
function createAltitudePOI(_position, _color, _value, _balloonType, _subValue) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 200;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _value, _balloonType, _subValue);
	let nIndex = GLOBAL.n_index;

	if (Symbol.insertIcon('Icon' + nIndex, imageData, drawCanvas.width, drawCanvas.height)) {
		const icon = Symbol.getIcon('Icon' + nIndex);

		let poi = Module.createPoint('POI' + nIndex);
		poi.setPosition(_position);    // 위치 설정
		poi.setIcon(icon);             // 아이콘 설정

		POILayer.addObject(poi, 0);    // 레이어에 객체 추가
		GLOBAL.n_index++;               // 인덱스 증가
	}
}

/* 반경 측정 POI 생성 함수 */
function createRadiusPOI(_position, _color, _value, _balloonType) {
	const drawCanvas = document.createElement('canvas');
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	const imageData = drawIcon(drawCanvas, _color, _value, _balloonType);

	if (Symbol.insertIcon('Icon', imageData, drawCanvas.width, drawCanvas.height)) {
		let icon = Symbol.getIcon('Icon');

		let poi = Module.createPoint('POI');
		poi.setPosition(_position);     // 위치 설정
		poi.setIcon(icon);              // 아이콘 설정

		POILayer.addObject(poi, 0);     // 레이어에 오브젝트 추가
	}
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

// 고도 측정 결과 리스트 표시
function viewAltiResult(lon, lat, alt, gAlt, oAlt) {
	const objList = document.getElementById('xd-object-list');
	const itemCount = objList.children.length + 1;

	objList.insertAdjacentHTML('afterbegin', createAltiResultHTML(lon, lat, alt, gAlt, oAlt, itemCount));
}

// 측정된 오브젝트 UI 리스트에 추가
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

// 오브젝트 개별 삭제
function deleteObject(_key) {
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
	}

	Module.XDRenderData(); // 화면 다시 렌더링
}

// 반경 측정 - 아이콘 삭제
function clearRadiusIcon() {
	if (POILayer === null) {
		return;
	}

	let icon, poi;
	poi = POILayer.keyAtObject('POI');

	if (poi == null) {
		return;
	}

	icon = poi.getIcon();

	POILayer.removeAtKey('POI');

	Symbol.deleteIcon(icon.getId());
}
