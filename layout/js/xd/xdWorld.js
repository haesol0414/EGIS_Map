var GLOBAL = {
	m_objcount: 0,  // 측정 오브젝트(POI)의 개수
	m_mercount: 0,  // 측정 작업의 총 개수
	n_index: 0      // 고도 측정 인덱스 관리
};
let Symbol, // 아이콘 관리 심볼 객체
	POILayer, // POI 저장 레이어
	WallLayer; // 반경 벽 저장 레이어

var Module = {
	locateFile: function(s) {
		return 'https://cdn.xdworld.kr/latest/' + s;
	},
	postRun: function() {
		Module.initialize({
			container: document.getElementById('xd-map'),
			terrain: {
				dem: {
					url: 'https://xdworld.vworld.kr',
					name: 'dem',
					servername: 'XDServer3d',
					encoding: true
				},
				image: {
					url: 'https://xdworld.vworld.kr',
					name: 'tile',
					servername: 'XDServer3d'
				}
			},
			defaultKey: 'DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I=='
		});


		// 카메라 위치 설정
		Module.getViewCamera().look(
			new Module.JSVector3D(126.93831646026437, 37.517164463389214, 629.4693173738196), // 카메라 위치
			new Module.JSVector3D(126.93866761878483, 37.52295801173619, 10.460245016030967)  // 카메라가 바라보는 위치
		);

		// 렌더링 옵션 설정
		Module.getOption().SetAreaMeasurePolygonDepthBuffer(false);
		Module.getOption().SetDistanceMeasureLineDepthBuffer(false);

		// 콜백 등록
		Module.getOption().callBackAddPoint(addPoint);
		Module.getOption().callBackCompletePoint(endPoint);

		// 반경 측정 이벤트 리스너 등록
		// Module.canvas.addEventListener("Fire_EventAddRadius", function(e){
		// 	if(e.dTotalDistance > 0) {
		// 		clearRadiusIcon();
		//
		// 		createPOI( new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true );
		// 	}
		// });

		// 고도 측정 이벤트 리스너 등록
		Module.canvas.addEventListener('Fire_EventAddAltitudePoint', altitudeHandler);

		// 아이콘 관리 심볼 생성
		Symbol = Module.getSymbol();

		// POI 레이어 생성
		let layerList = new Module.JSLayerList(true);
		POILayer = layerList.createLayer('MEASURE_POI', Module.ELT_3DPOINT);
		POILayer.setMaxDistance(20000.0);
		POILayer.setSelectable(false);

		// 반경 측정 벽 레이어
		WallLayer = layerList.createLayer('MEASURE_WALL', Module.ELT_POLYHEDRON);
		WallLayer.setMaxDistance(20000.0);
		WallLayer.setSelectable(false);
		WallLayer.setEditable(true);

		// XDServer 레이어 생성 (건물 데이터 로드)
		Module.getTileLayerList().createXDServerLayer({
			url: 'https://xdworld.vworld.kr',
			servername: 'XDServer3d',
			name: 'facility_build',
			type: 9,
			minLevel: 0,
			maxLevel: 15
		});

		console.log('XDWorld 엔진 로딩 완료');
	}
};


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