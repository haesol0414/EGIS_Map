var GLOBAL = {
	m_objcount: 0,  // 측정 오브젝트(POI)의 개수
	m_mercount: 0,  // 측정 작업의 총 개수
	n_index: 0      // 고도 측정 인덱스 관리
};
let Symbol, // 아이콘 관리 심볼 객체
	POILayer, // POI 저장 레이어
	WallLayer; // 반경 벽 저장 레이어

// XDServer 레이어 변수 (초기값 null)
let xdLayer = null;
const switchBtn = document.getElementById('xd-switch');

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

		// 고도 측정 이벤트 리스너 등록
		Module.canvas.addEventListener('Fire_EventAddAltitudePoint', altitudeHandler);

		// 객체 선택 이벤트 등록
		Module.canvas.addEventListener('Fire_EventSelectedObject', function() {
			console.log('객체선택22');
		});

		// 아이콘 관리 심볼 생성
		Symbol = Module.getSymbol();

		// POI 레이어 생성
		let layerList = new Module.JSLayerList(true);
		POILayer = layerList.createLayer('MEASURE_POI', Module.ELT_3DPOINT);
		POILayer.setMaxDistance(20000.0);
		POILayer.setSelectable(true);					// 클릭 이벤트 허용

		// 반경 측정 벽 레이어
		WallLayer = layerList.createLayer('MEASURE_WALL', Module.ELT_POLYHEDRON);
		WallLayer.setMaxDistance(20000.0);
		WallLayer.setSelectable(false);
		WallLayer.setEditable(true);

		// 건물 레이어
		// Module.getTileLayerList().createXDServerLayer({
		// 	url: 'https://xdworld.vworld.kr',
		// 	servername: 'XDServer3d',
		// 	name: 'facility_build',
		// 	type: 9,
		// 	minLevel: 0,
		// 	maxLevel: 15
		// });


		// CustomLayer on/off
		switchBtn.addEventListener('click', function () {
			if (switchBtn.checked) {
				console.log('Layer on');
			} else {
				console.log('Layer off');
			}
		});

		console.log('XDWorld 엔진 로딩 완료');
	}
};
