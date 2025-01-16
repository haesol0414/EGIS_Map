const mapDiv = document.getElementById('xd-map');
const drawLineBtn = document.getElementById('draw-line-btn');
const clearLineBtn = document.getElementById('clear-line-btn');

const GLOBAL = {
	m_objcount: 0,  // 측정 오브젝트(POI)의 개수
	m_mercount: 0,  // 측정 작업의 총 개수
	n_index: 0      // 고도 측정 인덱스 관리
};
const XD = {
	Option: null,   // 설정 옵션 (초기값 null)
	Camera: null,   // 카메라 객체 (초기값 null)
	Symbol: null    // 심볼 객체 (초기값 null)
};
let POILayer = null;  // POI 저장 레이어
let WallLayer = null;  // 반경 벽 저장 레이어
let LineLayer = null;  // 라인 저장 레이어
let BuildLayer = null;	// 건물 레이어

var Module = {
	locateFile: function(s) {
		return 'https://cdn.xdworld.kr/latest/' + s;
	},
	postRun: function() {
		Module.initialize({
			container: mapDiv,
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

		XD.Camera = Module.getViewCamera();
		XD.Option = Module.getOption();
		XD.Symbol = Module.getSymbol();

		// 카메라 위치 설정
		XD.Camera.look(
			new Module.JSVector3D(127.473064, 36.637952, 33200.4693173738196),
			new Module.JSVector3D(127.473064, 36.637952, 10.460245016030967)
		);

		// 렌더링 옵션 설정
		XD.Option.SetAreaMeasurePolygonDepthBuffer(false);
		XD.Option.SetDistanceMeasureLineDepthBuffer(false);

		// 콜백 등록
		XD.Option.callBackAddPoint(addPoint);
		XD.Option.callBackCompletePoint(endPoint);

		// 고도 측정 이벤트 리스너 등록
		Module.canvas.addEventListener('Fire_EventAddAltitudePoint', altitudeHandler);

		// 객체 선택 이벤트 등록
		Module.canvas.addEventListener('Fire_EventSelectedObject', selectHandler);

		// POI 레이어 생성
		let layerList = new Module.JSLayerList(true);
		POILayer = createLayer(layerList, 'MEASURE_POI', Module.ELT_3DPOINT, {
			maxDistance: 20000.0,
			selectable: true
		});

		// 반경 벽 레이어 생성
		WallLayer = createLayer(layerList, 'MEASURE_WALL', Module.ELT_POLYHEDRON, {
			maxDistance: 20000.0,
			selectable: true,
			editable: true
		});

		// 라인 레이어 생성
		LineLayer = createLayer(layerList, 'LINE_LAYER', Module.ELT_3DLINE,  options = {
			selectable: true,
		});

		// 건물 레이어 생성
		BuildLayer = createBuildingLayer();

		console.log('XDWorld 엔진 로딩 완료');
	}
};
