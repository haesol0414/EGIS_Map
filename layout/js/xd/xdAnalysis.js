const distanceBtn = document.getElementById('distance-btn');
const areaBtn = document.getElementById('area-btn');
const clearBtn = document.getElementById('xd-clear-btn');
const radiusBtn = document.getElementById('radius-btn');
const altitudeBtn = document.getElementById('altitude-btn');

// 고도 측정 이벤트 핸들러
function altitudeHandler(e) {
	createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
		"rgba(10, 10, 0, 0.5)",
		e.dGroundAltitude, false, e.dObjectAltitude);

	viewAltiResult(e.dLon, e.dLat, e.dAlt, e.dGroundAltitude, e.dObjectAltitude);
}

// POI 추가 콜백
function addPoint(e) {
	const currentState = getMouseState();

	if (currentState === 'distance') {
		console.log('거리 측정');
		let partDistance = e.dDistance,
			totalDistance = e.dTotalDistance;

		if (partDistance === 0 && totalDistance === 0) {
			m_objcount = 0;
			createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', 'Start', true);

			return;
		}

		if (e.dDistance > 0.01) {
			createPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 255, 0, 0.8)', e.dDistance, false);
		}
		createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', e.dTotalDistance, true);

		return;
	}

	if (currentState === 'area') {
		console.log('면적 측정');
		if (e.dArea > 0) {
			createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), 'rgba(255, 204, 198, 0.8)', `${e.dArea.toFixed(2)}m²`, true);
		}

		return;
	}

	if (currentState === 'radius') {
		console.log('반경 측정');
		if (e.dTotalDistance > 0) {
			clearRadiusIcon();
			createPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), 'rgba(255, 204, 198, 0.8)', e.dTotalDistance, true);
		}
	}
}

// POI 추가 완료 콜백
function endPoint(e) {
	viewListOBjKey(e); // UI 목록에 추가
	GLOBAL.m_mercount++; // 작업 카운트 증가
}

// 화면 초기화
function clearAnalysis() {
	document.querySelectorAll('.map-tool-btn.active').forEach(btn => btn.classList.remove('active'));

	// 측정 관련 객체 초기화
	Module.XDClearDistanceMeasurement();
	Module.XDClearAreaMeasurement();
	Module.XDClearCircleMeasurement();
	clearRadiusIcon();

	// 오브젝트 전체 삭제
	if (POILayer != null) {
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

	// 화면 렌더링
	Module.XDRenderData();
}

/* ========================= 버튼 이벤트 ============================= */
// 거리 측정 버튼
distanceBtn.addEventListener('click', () => {
	clearAnalysis();
	distanceBtn.classList.add('active');

	setMouseState('distance'); // 거리 측정 모드
	console.log('거리 측정');
});

// 면적 측정 버튼
areaBtn.addEventListener('click', () => {
	clearAnalysis();
	areaBtn.classList.add('active');

	setMouseState('area'); // 면적 측정 모드
	console.log('면적 측정');
});

// 고도 측정 버튼
altitudeBtn.addEventListener('click', () => {
	clearAnalysis();
	altitudeBtn.classList.add('active');

	setMouseState('altitude'); // 고도 측정 모드
	console.log('고도 측정');
});

// 반경 측정 버튼
radiusBtn.addEventListener('click', () => {
	clearAnalysis();
	radiusBtn.classList.add('active');

	setMouseState('radius'); // 반경 측정 모드
	console.log('반경 측정');
});

// 초기화 버튼
clearBtn.addEventListener('click', () => {
	clearAnalysis();

	setMouseState('move');
	console.log('분석 내용 초기화');
});