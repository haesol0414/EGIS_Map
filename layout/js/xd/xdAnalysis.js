
const distanceBtn = document.getElementById("distance-btn");
const areaBtn = document.getElementById("area-btn");
const clearBtn = document.getElementById("xd-clear-btn");

// 거리 측정 버튼
distanceBtn.addEventListener("click", () => {
    clearAnalysis();

    distanceBtn.classList.add("active");
    Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT);
    console.log("거리 측정");
});

// 면적 측정 버튼
areaBtn.addEventListener("click", () => {
    clearAnalysis();
    areaBtn.classList.add("active");
    Module.XDSetMouseState(Module.MML_ANALYS_AREA_PLANE);
    console.log("면적 측정");
});

clearBtn.addEventListener("click", () => {
    clearAnalysis();
    console.log("분석 내용이 초기화되었습니다.");
});

// 화면 초기화
function clearAnalysis() {
    document.querySelectorAll(".map-tool-btn.active").forEach(btn => btn.classList.remove("active"));

    Module.XDClearDistanceMeasurement();
    Module.XDClearAreaMeasurement();

    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer != null) {
        layer.removeAll();
        console.log("레이어가 성공적으로 삭제되었습니다.");
    }

    let cell = document.getElementById("objList");
    while (cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
    }

    GLOBAL.m_mercount = 0;
    GLOBAL.m_objcount = 0;

    Module.XDSetMouseState(Module.MML_MOVE_GRAB);
    Module.XDRenderData();
}

// POI 추가 콜백
function addPoint(e) {
    const mouseState = Module.XDGetMouseState();

    if (mouseState === Module.MML_ANALYS_DISTANCE || mouseState === Module.MML_ANALYS_DISTANCE_STRAIGHT) {
        console.log("거리 측정 상태 확인");
        if (e.dDistance > 0.01) {
            createDiscPOI(
                new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt),
                "rgba(255, 255, 0, 0.8)",
                `${e.dDistance.toFixed(2)}m`,
                false
            );
        }
        createDiscPOI(
            new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
            "rgba(255, 204, 198, 0.8)",
            `${e.dTotalDistance.toFixed(2)}m`,
            true
        );
    } else if (mouseState === Module.MML_ANALYS_AREA || mouseState === Module.MML_ANALYS_AREA_PLANE) {
        console.log("면적 측정 상태 확인");
        createAreaPOI(
            new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
            "rgba(255, 204, 198, 0.8)",
            `${e.dArea.toFixed(2)}m²`,
            true
        );
    } else if (mouseState === Module.MML_ANALYS_AREA_CIRCLE) {
        console.log('반경 측정중');
    } else {
        console.warn("알 수 없는 마우스 상태:", mouseState);
    }
}

// 측정 완료 콜백
function endPoint(e) {
    viewListOBjKey(e);
    GLOBAL.m_mercount++;
}

// 거리 측정 POI 생성 함수
function createDiscPOI(position, color, value, balloonType) {
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    const uniqueKey = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;

    const poi = Module.createPoint(uniqueKey);
    poi.setPosition(position);
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
    layer.addObject(poi, 0);

    GLOBAL.m_objcount++;
    Module.XDRenderData();
}

// 면적 측정 POI 생성
function createAreaPOI(position, color, value, balloonType) {
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    const key = GLOBAL.m_mercount + "_AREA_POI";
    layer.removeAtKey(key);

    const poi = Module.createPoint(key);
    poi.setPosition(position);
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
    layer.addObject(poi, 0);

    Module.XDRenderData();
}

// Object를 UI 리스트에 추가
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

    // 리스트 항목에 버튼 추가
    li.appendChild(deleteBtn);
    cell.appendChild(li);
}

// Object 삭제
function deleteObject(_key) {
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer) {
        let list = layer.getObjectKeyList();
        let poiKeyPattern = `${_key.match(/\d+/g)?.[0]}_`;

        let strlist = list.split(",");
        strlist.forEach((item) => {
            if (item.startsWith(poiKeyPattern)) {
                layer.removeAtKey(item);
                console.log("POI 객체 삭제:", item);
            }
        });

        document.getElementById(_key).remove();
    } else {
        console.warn("POI 레이어를 찾을 수 없음");
    }

    Module.XDClearDistanceObject(_key);
    Module.XDClearAreaObject(_key);

    Module.XDRenderData();
    console.log("화면 렌더링 완료");
}
