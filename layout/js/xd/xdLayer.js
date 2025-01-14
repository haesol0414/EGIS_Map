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
switchBtn.addEventListener('click', function () {
	if (switchBtn.checked) {
		BuildLayer.setVisible(true);
		console.log('building Layer on');
	} else {
		BuildLayer.setVisible(false);
		console.log('building Layer off');
	}
});
