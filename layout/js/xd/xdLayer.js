const switchBtn = document.getElementById('xd-switch');

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
	const BuildLayerOptions = {
		url: 'https://xdworld.vworld.kr',
		servername: 'XDServer3d',
		name: 'facility_build',
		type: 9,
		minLevel: 0,
		maxLevel: 15
	};

	const buildlayer = Module.getTileLayerList().createXDServerLayer(BuildLayerOptions);
	buildlayer.setSelectable(false);
	buildlayer.setVisible(false);

	return buildlayer;
}

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


// WMS 레이어 ================================== *
const wmsOnBtn = document.getElementById('create-wms-btn');
wmsOnBtn.addEventListener('click', createWmsLayer);

function createWmsLayer() {
	const layerList = new Module.JSLayerList(false);
	let wmsLayer = layerList.nameAtLayer('wmslayer');

	if (wmsLayer != null) {
		wmsLayer.clearWMSCache();
		layerList.delLayerAtName('wmslayer');
	}

	// url 필드 값 가져오기
	const urlInput = document.getElementById('url-input').value;

	// 체크된 레이어 값 가져오기
	const checkedLayers = Array.from(document.querySelectorAll('.layer-wrap input[type="radio"]:checked'))
		.map(checkbox => checkbox.value)
		.join(',');

	if (!checkedLayers) {
		alert('레이어를 선택해주세요');
		return;
	}

	// 속성 필터링
	const cqlFilter = encodeURIComponent('alias LIKE \'%상당구\'');

	// wms 레이어 생성
	wmsLayer = layerList.createWMSLayer('wmslayer');

	// 옵션 설정
	const slopeOption = {
		url: urlInput,
		layer: checkedLayers,
		minimumlevel: 10,
		maximumlevel: 20,
		tilesize: 256,
		crs: 'EPSG:4326',
		parameters: {
			version: '1.1.0',
			cql_filter: cqlFilter
		}
	};

	wmsLayer.setWMSProvider(slopeOption);
	wmsLayer.setBBoxOrder(true); 				// BBox 좌표 순서 기본값 설정
	wmsLayer.setProxyRequest(false); 			// Proxy 사용 안 함

	console.log('WMS Layer 생성 : ', wmsLayer);
}


// 샌드박스
// url: 'https://2dmap.egiscloud.com/geoserver/wms?',
// layer: 'w_admin:user_shp_admin_1706495499027',

// 선택된 레이어 체크박스의 값을 배열로 수집
// const selectedLayers = [];
// const layerCheckboxes = document.querySelectorAll('input[name="layer"]:checked');
// layerCheckboxes.forEach((checkbox) => {
// 	selectedLayers.push(checkbox.value);
// });
//
// // 레이어 값들을 쉼표로 구분된 문자열로 결합
// const targetLayer = selectedLayers.join(',');