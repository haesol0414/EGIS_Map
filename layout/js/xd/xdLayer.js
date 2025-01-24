const switchBtn = document.getElementById('xd-switch');
const wmsOnBtn = document.getElementById('create-wms-btn');

// 레이어 생성
function createLayer(layerList, layerName, layerType, options = {}) {
	let layer = layerList.createLayer(layerName, layerType);

	if (options.maxDistance !== undefined) {
		layer.setMaxDistance(options.maxDistance);
	}
	if (options.selectable !== undefined) {
		layer.setSelectable(options.selectable);
	}
	if (options.editable !== undefined) {
		layer.setEditable(options.editable);
	}
	if (options.visible !== undefined) {
		layer.setVisible(options.visible);
	}

	return layer;
}

// 측정 레이어 전체 삭제
function clearLayers() {
	if (POILayer !== null) {
		POILayer.removeAll();
	}
	if (WallLayer !== null) {
		WallLayer.removeAll();
	}

	// li 초기화
	clearHtmlObjectList('xd-object-list');
}

// 라인 레이어 삭제
function clearLineLayer() {
	if (LineLayer !== null) {
		LineLayer.removeAll();
	}

	clearHtmlObjectList('line-obj-list');
}

// 건물 레이어 생성 및 on/off
function createBuildingLayer() {
	// 건물 레이어 생성
	const options = {
		url: 'https://xdworld.vworld.kr',
		servername: 'XDServer3d',
		name: 'facility_build',
		type: 9,
		minLevel: 0,
		maxLevel: 15
	};

	const buildlayer = Module.getTileLayerList().createXDServerLayer(options);
	buildlayer.setSelectable(false);
	buildlayer.setVisible(false);

	return buildlayer;
}

// 청주 건물 레이어 생성
function createCjBuildingLayer() {
	// 건물 레이어 생성
	const options = {
		url : "http://203.228.54.49:8077",
		servername : "XDServer",
		name : "bldg_cj_lod3_5186",
		type : 9,
		minLevel : 0,
		maxLevel : 15
	};

	const cjLayer = Module.getTileLayerList().createXDServerLayer(options);
	cjLayer.setVisible(true);
	cjLayer.setSelectable(false);

	return cjLayer;
}



// wms 레이어 생성
function createWmsLayerWithXd() {
	const layerList = new Module.JSLayerList(false);
	let wmsLayer = layerList.nameAtLayer('wmslayer');

	if (wmsLayer != null) {
		clearWmsLayerWithXd();
	}

	// url 필드 값 가져오기
	const urlInput = document.getElementById('url-input').value;

	// 체크된 레이어 값 가져오기
	const checkedLayer = Array.from(document.querySelectorAll('.layer-wrap input[type="radio"]:checked'))
		.map(checkbox => checkbox.value)
		.join(',');

	// 라디오 버튼 상태 확인
	const selectedRadio = document.querySelector('.layer-wrap input[type="radio"]:checked');
	const cqlCheck = document.getElementById('cql-check');

	if (selectedRadio.id !== 'layer1') {
		// 체크박스를 비활성화 및 체크 해제
		cqlCheck.checked = false;
		cqlCheck.disabled = true;
	} else {
		// 체크박스를 활성화
		cqlCheck.disabled = false;
	}

	if (!checkedLayer) {
		alert('레이어를 선택해주세요');
		return;
	}

	// wms 레이어 생성
	wmsLayer = layerList.createWMSLayer('wmslayer');

	// 속성 필터링 설정
	const cqlFilter = encodeURIComponent('alias LIKE \'%상당구\'');

	// 옵션 설정
	const slopeOption = {
		url: urlInput,
		layer: checkedLayer,
		minimumlevel: 10,
		maximumlevel: 20,
		tilesize: 256,
		crs: 'EPSG:4326',
		parameters: {
			version: '1.1.0',
			...(cqlCheck.checked && { cql_filter: cqlFilter }) // 체크박스 상태에 따라 cql_filter 추가
		}
	};

	wmsLayer.setWMSProvider(slopeOption);
	wmsLayer.setBBoxOrder(true); 				// BBox 좌표 순서 기본값 설정
	wmsLayer.setProxyRequest(false); 			// Proxy 사용 안 함

	console.log('WMS Layer 생성 : ', wmsLayer);
}

// wms 레이어 초기화
const clearWmsBtn = document.getElementById('clear-wms-btn');
clearWmsBtn.addEventListener('click', clearWmsLayerWithXd);

function clearWmsLayerWithXd() {
	const layerList = new Module.JSLayerList(false);
	let wmsLayer = layerList.nameAtLayer('wmslayer');

	wmsLayer.clearWMSCache();
	layerList.delLayerAtName('wmslayer');
}

// WMS 레이어 생성 버튼 이벤트
wmsOnBtn.addEventListener('click', createWmsLayerWithXd);

// 고도 측정 시 건물 레이어 on/off
switchBtn.addEventListener('click', function() {
	if (switchBtn.checked) {
		BuildLayer.setVisible(true);
		console.log('building Layer on');
	} else {
		BuildLayer.setVisible(false);
		console.log('building Layer off');
	}
});

