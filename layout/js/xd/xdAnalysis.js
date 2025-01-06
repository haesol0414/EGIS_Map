// 거리/면적 POI 추가 콜백
function addPoint(e) {
    const currentState = getCurrentMouseState();

    if (currentState === "distance") {
        console.log('거리 측정');
        let partDistance = e.dDistance,
            totalDistance = e.dTotalDistance;

        if (partDistance === 0 && totalDistance === 0) {
            m_objcount = 0;

            createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", "Start", true);
        } else {
            if (e.dDistance > 0.01) {
                createPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 255, 0, 0.8)", e.dDistance, false);
            }
            createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true);
        }
    } else if (currentState === "area") {
        console.log('면적 측정');

        // 최종 면적값 POI 생성
        if (e.dArea > 0) {
            createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", `${e.dArea.toFixed(2)}m²`, true);
        }
    } else {
        console.warn("알 수 없는 마우스 상태:", currentState);
    }
}

// 거리/면적 측정 완료 콜백
function endPoint(e) {
    viewListOBjKey(e); // UI 목록에 추가
    GLOBAL.m_mercount++; // 작업 카운트 증가
}

// 화면 초기화
function clearAnalysis() {
    document.querySelectorAll(".map-tool-btn.active").forEach(btn => btn.classList.remove("active"));
    
    // 측정관련 객체 초기화
    Module.XDClearDistanceMeasurement();
    Module.XDClearAreaMeasurement();
    Module.XDClearCircleMeasurement();

    if (WallLayer == null) {
        return;
    }

    clearIcon();
    WallLayer.removeAll();

    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer != null) {
        layer.removeAll();
    }

    let cell = document.getElementById("objList");
    while (cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
    }

    GLOBAL.m_mercount = 0;
    GLOBAL.m_objcount = 0;

    Module.XDRenderData();
}
