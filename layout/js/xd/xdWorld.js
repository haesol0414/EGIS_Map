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
let WallLayer  = null;  // 반경 벽 저장 레이어
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

		XD.Camera = Module.getViewCamera();
		XD.Option = Module.getOption();
		XD.Symbol = Module.getSymbol();

		// 카메라 위치 설정
		XD.Camera.look(
			new Module.JSVector3D(126.93831646026437, 37.517164463389214, 629.4693173738196), // 카메라 위치
			new Module.JSVector3D(126.93866761878483, 37.52295801173619, 10.460245016030967)  // 카메라가 바라보는 위치
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
		Module.canvas.addEventListener('Fire_EventSelectedObject', function(e) {
			console.log("e = ", e);
			const layerList = new Module.JSLayerList(true);
			const targetLayerName = layerList.nameAtLayer(e.layerName);
			console.log("targetLayerName = ", targetLayerName);
			console.log("e.objKey = ", e.objKey);
			const obj = targetLayerName.keyAtObject(e.objKey);
			console.log("obj = ", obj);
			console.log("obj.getId = ", obj.getId());
			console.log("obj.getPosition = ", obj.getPosition());
			console.log("obj.getName = ", obj.getName());
			console.log("obj.getDescription = ", obj.getDescription());
			console.log("obj.getVisible = ", obj.getVisible());

			obj.setName("test!!");
			obj.setDescription("Description!!!!");

			console.log("obj.getName = ", obj.getName());
			console.log("obj.getDescription = ", obj.getDescription());

		});

		// POI 레이어 생성
		let layerList = new Module.JSLayerList(true);
		POILayer = layerList.createLayer('MEASURE_POI', Module.ELT_3DPOINT);
		POILayer.setMaxDistance(20000.0);
		POILayer.setSelectable(true);					// 클릭 이벤트 허용

		// 반경 벽 레이어
		WallLayer = layerList.createLayer("MEASURE_WALL", Module.ELT_POLYHEDRON);
		WallLayer.setMaxDistance(20000.0);
		WallLayer.setSelectable(true);
		WallLayer.setEditable(true);

		// 건물 레이어
		const buildLayer = Module.getTileLayerList().createXDServerLayer({
			url: 'https://xdworld.vworld.kr',
			servername: 'XDServer3d',
			name: 'facility_build',
			type: 9,
			minLevel: 0,
			maxLevel: 15
		});
		buildLayer.setVisible(false);

		// 반경 측정시에는 건물 레이어 off, 그 외 거리, 면적, 고도 측정시에는 on
		switchBtn.addEventListener('click', function() {
			let location = XD.Camera.getLocation();
			XD.Camera.setLocation(new Module.JSVector3D(location.Longitude, location.Latitude, location.Altitude));

			if (switchBtn.checked) {
				// 현재 위치에서 건물 올리도록 각도 조정 필요 (3D)
				XD.Camera.setTilt(60);
				XD.Camera.setDistance(600.0);

				buildLayer.setVisible(true);
				console.log('building Layer on');
			} else {
				// 현재 위치에서 건물 내리도록 각도 조정 필요 (2D)
				XD.Camera.setTilt(90);
				XD.Camera.setDistance(800.0);

				buildLayer.setVisible(false);
				console.log('building Layer off');
			}
		});

		console.log('XDWorld 엔진 로딩 완료');
	}
};
