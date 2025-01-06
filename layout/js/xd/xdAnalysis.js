const distanceBtn = document.getElementById("distance-btn");
const areaBtn = document.getElementById("area-btn");
const clearBtn = document.getElementById("xd-clear-btn");
const radiusBtn = document.getElementById("radius-btn");
// const AltitudeBtn = document.getElementById("altitude-btn");
let Symbol, // Icon management symbol object
    POILayer, // POI storage layer
    WallLayer; // Radius wall storage layer


// 거리 측정 버튼
distanceBtn.addEventListener("click", () => {
    clearAnalysis();

    distanceBtn.classList.add("active");
    Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT); // 거리 측정 모드 활성화
    console.log("거리 측정");
});

// 면적 측정 버튼
areaBtn.addEventListener("click", () => {
    clearAnalysis();

    areaBtn.classList.add("active"); // 버튼 활성화 표시
    Module.XDSetMouseState(Module.MML_ANALYS_AREA_PLANE); // 면적 측정 모드 활성화
    console.log("면적 측정");
});

// 초기화 버튼
clearBtn.addEventListener("click", () => {
    clearAnalysis();
    console.log("분석 내용 초기화");
});

// 화면 초기화
function clearAnalysis() {
    // 활성화된 모든 버튼 비활성화
    document.querySelectorAll(".map-tool-btn.active").forEach(btn => btn.classList.remove("active"));

    // 거리 및 면적 측정 초기화
    Module.XDClearDistanceMeasurement();
    Module.XDClearAreaMeasurement();

    // POI 레이어 삭제
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer != null) {
        layer.removeAll();
    }

    // UI 목록 초기화
    let cell = document.getElementById("objList");
    while (cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
    }

    // 작업 및 오브젝트 카운트 초기화
    GLOBAL.m_mercount = 0;
    GLOBAL.m_objcount = 0;

    // 마우스 상태 초기화
    Module.XDSetMouseState(Module.MML_MOVE_GRAB);

    // 화면 다시 렌더링
    Module.XDRenderData();
}

// POI 추가 콜백 (마우스 클릭으로 POI 추가)
function addPoint(e) {
    const mouseState = Module.XDGetMouseState();

    if (mouseState === Module.MML_ANALYS_DISTANCE || mouseState === Module.MML_ANALYS_DISTANCE_STRAIGHT) {
        console.log('거리 측정');

        // 중간 거리 POI
        if (e.dDistance > 0.01) {
            createPOI(e.dMidLon, e.dMidLat, e.dMidAlt, "rgba(255, 255, 0, 0.8)", `${e.dDistance.toFixed(2)}m`, false);
        }
        // 전체 거리 POI
        createPOI(e.dLon, e.dLat, e.dAlt, "rgba(255, 204, 198, 0.8)", `${e.dTotalDistance.toFixed(2)}m`, true);
    } else if (mouseState === Module.MML_ANALYS_AREA || mouseState === Module.MML_ANALYS_AREA_PLANE) {
        console.log('면적 측정');

        // 최종 면적값 POI 생성
        if (e.dArea > 0) {
            createPOI(e.dLon, e.dLat, e.dAlt, "rgba(255, 204, 198, 0.8)", `${e.dArea.toFixed(2)}m²`, true);
        }
    } else if (mouseState === Module.MML_ANALYS_AREA_CIRCLE) {
        console.log('반경 측정');
    } else {
        console.warn("알 수 없는 마우스 상태:", mouseState);
    }
}

// POI 생성 함수
function createPOI(lon, lat, alt, color, value, balloonType) {
    const mouseState = Module.XDGetMouseState();

    // POI 아이콘 이미지를 그리기 위한 캔버스 생성
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    // 아이콘 이미지 데이터 생성
    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    // POI 레이어 가져오기
    const layerList = new Module.JSLayerList(true);
    const layer = layerList.nameAtLayer("MEASURE_POI");

    const key = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;

    // 면적 측정 마우스 상태일 때만 기존 POI 삭제
    if (mouseState === Module.MML_ANALYS_AREA || mouseState === Module.MML_ANALYS_AREA_PLANE) {
        layer.removeAtKey(key);
    }

    // 새로운 POI 생성
    const poi = Module.createPoint(key);
    poi.setPosition(new Module.JSVector3D(lon, lat, alt));
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
    layer.addObject(poi, 0);

    // 거리 측정 마우스 상태일 때만 객체 카운트 증가
    if (mouseState === Module.MML_ANALYS_DISTANCE || mouseState === Module.MML_ANALYS_DISTANCE_STRAIGHT) {
        GLOBAL.m_objcount++;
    }

    Module.XDRenderData();
}

// 측정 완료 콜백 (더블 클릭 시 호출)
function endPoint(e) {
    viewListOBjKey(e); // UI 목록에 추가
    GLOBAL.m_mercount++; // 작업 카운트 증가
}

// 측정된 오브젝트 UI 리스트에 추가
function viewListOBjKey(key) {
    const cell = document.getElementById("objList");
    const li = document.createElement("li");

    li.id = key;
    li.textContent = key;
    li.classList.add("distance-li");

    // 삭제 버튼 생성
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.classList.add("distance-del-btn");

    deleteBtn.addEventListener("click", () => {
        deleteObject(key);
    });

    li.appendChild(deleteBtn); // 리스트 항목에 삭제 버튼 추가
    cell.appendChild(li); // 리스트에 항목 추가
}

// 오브젝트 삭제
function deleteObject(_key) {
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer) {
        let list = layer.getObjectKeyList();
        let poiKeyPattern = `${_key.match(/\d+/g)?.[0]}_`;

        // 레이어의 키와 매칭하여 삭제
        let strlist = list.split(",");
        strlist.forEach((item) => {
            if (item.startsWith(poiKeyPattern)) {
                layer.removeAtKey(item);
                console.log("오브젝트 삭제:", item);
            }
        });

        document.getElementById(_key).remove();
    } else {
        console.warn("POI 레이어를 찾을 수 없음");
    }

    Module.XDClearDistanceObject(_key); // 거리 객체 초기화
    Module.XDClearAreaObject(_key); // 면적 객체 초기화

    Module.XDRenderData(); // 화면 다시 렌더링

    console.log("화면 렌더링 완료");
}
