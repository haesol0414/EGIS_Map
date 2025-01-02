var GLOBAL = {
    m_objcount: 0, // 측정 오브젝트(POI)의 개수
    m_mercount: 0, // 측정 작업의 총 개수
};

var Module = {
    locateFile: function (s) {
        return "https://cdn.xdworld.kr/latest/" + s;
    },
    postRun: function () {
        Module.initialize({
            container: document.getElementById("xd-map"),
            terrain: {
                dem: {
                    url: "https://xdworld.vworld.kr",
                    name: "dem",
                    servername: "XDServer3d",
                    encoding: true
                },
                image: {
                    url: "https://xdworld.vworld.kr",
                    name: "tile",
                    servername: "XDServer3d"
                }
            },
            defaultKey: "DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I=="
        });

        // 카메라 위치 설정
        Module.getViewCamera().setLocation(new Module.JSVector3D(126.92836647767662, 37.52439503321471, 1000.0));

        // POI 레이어 생성
        let layerList = new Module.JSLayerList(true);
        let layer = layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);
        layer.setMaxDistance(20000.0);
        layer.setSelectable(false);

        // 면적 측정 선의 렌더링 옵션 설정
        Module.getOption().SetAreaMeasurePolygonDepthBuffer(false); // WEBGL의 GL_DEPTH_TEST 설정
        Module.getOption().SetDistanceMeasureLineDepthBuffer(false); // Set WEBGL GL_DEPTH_TEST configuration

        // 지속적인 사용을 위한 콜백 함수 설정
        Module.getOption().callBackAddPoint(addPoint);    // 마우스 입력 시 발생하는 콜백, 성공 시 성공 반환, 실패 시 오류 반환
        Module.getOption().callBackCompletePoint(endPoint); // 측정 완료(더블 클릭) 시 발생하는 콜백, 성공 시 성공 반환, 실패 시 오류 반환

        console.log("XDWorld 엔진 로딩 완료");
    }
};

// 점 추가 콜백 함수
function addPoint(e) {
    const mouseState = Module.XDGetMouseState();

    if (mouseState === Module.MML_ANALYS_DISTANCE || mouseState === Module.MML_ANALYS_DISTANCE_STRAIGHT) {
        console.log("거리 측정 상태 확인");
        handleDistanceAddPoint(e);
    } else if (mouseState === Module.MML_ANALYS_AREA || mouseState === Module.MML_ANALYS_AREA_PLANE) {
        console.log("면적 측정 상태 확인");
        handleAreaAddPoint(e);
    } else {
        console.warn("알 수 없는 마우스 상태:", mouseState);
    }
}

// 거리 측정 로직
function handleDistanceAddPoint(e) {
    if (e.dDistance > 0.01) {
        console.log(`두 점 간 거리: ${e.dDistance.toFixed(2)}m`);
        createPOI(
            new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt),
            "rgba(255, 255, 0, 0.8)",
            `${e.dDistance.toFixed(2)}m`,
            false
        );
    }
    console.log(`총 거리: ${e.dTotalDistance.toFixed(2)}m`);
    createPOI(
        new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
        "rgba(255, 204, 198, 0.8)",
        `${e.dTotalDistance.toFixed(2)}m`,
        true
    );
}

// 면적 측정 로직
function handleAreaAddPoint(e) {
    createAreaPOI(
        new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
        "rgba(255, 204, 198, 0.8)",
        `${e.dArea.toFixed(2)}m²`,
        true
    );
}

// 측정 완료 콜백 함수
function endPoint(e) {
    console.log("측정 완료");
    viewListOBjKey(e); // 측정된 객체를 UI 리스트에 추가
    GLOBAL.m_mercount++; // 총 측정 작업 수 증가
}


// 측정된 객체를 UI 리스트에 추가
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

// 측정된 객체 삭제
function deleteObject(_key) {
    console.log("삭제할 키:", _key);

    // UI에서 리스트 항목 삭제
    let li = document.getElementById(_key);
    if (li) {
        li.remove();
        console.log("UI 리스트 항목 삭제 완료:", _key);
    } else {
        console.warn("UI 리스트 항목을 찾을 수 없음:", _key);
    }

    // POI 레이어에서 관련 객체 삭제
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer) {
        let list = layer.getObjectKeyList();
        console.log("레이어 객체 키 리스트:", list);

        // _key에서 숫자 부분만 추출
        let keyBase = _key.match(/\d+/g)?.[0]; // ANAL_DIST_1 -> "1"
        if (!keyBase) {
            console.error("키에서 숫자를 추출하지 못했습니다:", _key);
            return;
        }

        // POI 키 패턴 생성
        let poiKeyPattern = `${keyBase}_`; // 예: "1_" (1_10_POI와 매칭)
        console.log("삭제 - POI 키 패턴:", poiKeyPattern);

        // 레이어 객체 키와 비교하여 삭제
        let strlist = list.split(",");
        strlist.forEach((item) => {
            if (item.startsWith(poiKeyPattern)) {
                layer.removeAtKey(item);
                console.log("POI 객체 삭제:", item);
            }
        });
    } else {
        console.warn("POI 레이어를 찾을 수 없음");
    }

    // XDWorld에서 거리 및 면적 객체 초기화
    Module.XDClearDistanceObject(_key);
    Module.XDClearAreaObject(_key);

    // 화면 다시 렌더링
    Module.XDRenderData();
    console.log("화면 렌더링 완료");
}

// 초기화 함수
function clearAnalysis() {
    // 실행 중인 분석 내용 초기화
    Module.XDClearDistanceMeasurement();
    Module.XDClearAreaMeasurement();

    // 레이어 삭제
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

    // 화면 다시 렌더링
    Module.XDRenderData();
}

const distanceBtn = document.getElementById("distance-btn");
const areaBtn = document.getElementById("area-btn");
const clearBtn = document.querySelector(".map-tool-btn.initial");

distanceBtn.addEventListener("click", () => {
    clearAnalysis(); // 분석 초기화

    const currentState = distanceBtn.getAttribute("data-state"); // 현재 상태 확인

    if (currentState === "measure") {
        distanceBtn.setAttribute("data-state", "move");
        distanceBtn.classList.add("active"); // active 클래스 제거
        Module.XDSetMouseState(Module.MML_MOVE_GRAB);
        console.log("move");
    } else {
        distanceBtn.setAttribute("data-state", "measure");
        distanceBtn.classList.remove("active"); // active 클래스 추가
        Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT);
        console.log("거리 측정");
    }
});

// 면적 측정 버튼
areaBtn.addEventListener("click", () => {
    clearAnalysis(); // 분석 초기화

    const currentState = areaBtn.getAttribute("data-state"); // 현재 상태 확인

    if (currentState === "measure") {
        areaBtn.setAttribute("data-state", "move");
        areaBtn.classList.add("active"); // active 클래스 제거
        Module.XDSetMouseState(Module.MML_MOVE_GRAB);
        console.log("move");
    } else {
        areaBtn.setAttribute("data-state", "measure");
        areaBtn.classList.remove("active"); // active 클래스 추가
        Module.XDSetMouseState(Module.MML_ANALYS_AREA_PLANE);
        console.log("면적 측정");
    }
});

// 초기화 버튼
clearBtn.addEventListener("click", () => {
    clearAnalysis();
    console.log("분석 내용이 초기화되었습니다.");
});

// POI 생성 함수
function createPOI(position, color, value, balloonType) {
    // POI 이미지를 그릴 Canvas 생성
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    // 아이콘 이미지를 그려서 데이터 반환
    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    // POI 레이어에 아이콘 추가
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    // POI 키 생성 (고유한 키 보장)
    const uniqueKey = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;
    console.log("생성된 POI 키:", uniqueKey);

    const poi = Module.createPoint(uniqueKey);
    poi.setPosition(position);
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
    layer.addObject(poi, 0);

    // 생성된 POI 수 증가
    GLOBAL.m_objcount++;

    // 강제로 레이어 상태를 갱신
    Module.XDRenderData();
}


// 면적 측정 POI 생성
function createAreaPOI(position, color, value, balloonType) {
    // POI 아이콘 이미지를 그리기 위한 캔버스 생성
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    // 아이콘 이미지 데이터 생성
    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    // POI 레이어 가져오기
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    // 기존 POI 삭제
    const key = GLOBAL.m_mercount + "_AREA_POI"; // 면적 키 패턴 (유지 보장)
    layer.removeAtKey(key);

    // 새로운 POI 생성
    const poi = Module.createPoint(key);
    poi.setPosition(position); // 위치 설정
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height); // 아이콘 설정
    layer.addObject(poi, 0); // 레이어에 등록

    console.log("면적 POI 생성 완료:", key);

    // 화면 갱신
    Module.XDRenderData();
}


// 아이콘 이미지 생성 함수
function drawIcon(canvas, color, value, balloonType) {
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 아이콘 형태에 따라 그리기
    if (balloonType) {
        drawBalloon(ctx, canvas.height * 0.5, canvas.width, canvas.height, 5, canvas.height * 0.25, color);
        setText(ctx, canvas.width * 0.5, canvas.height * 0.2, value);
    } else {
        drawRoundRect(ctx, 0, canvas.height * 0.3, canvas.width, canvas.height * 0.25, 5, color);
        setText(ctx, canvas.width * 0.5, canvas.height * 0.5, value);
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

// 말풍선 형태의 배경 그리기
function drawBalloon(ctx, marginBottom, width, height, barWidth, barHeight, color) {
    const wCenter = width * 0.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height - barHeight - marginBottom);
    ctx.lineTo(wCenter - barWidth, height - barHeight - marginBottom);
    ctx.lineTo(wCenter, height - marginBottom);
    ctx.lineTo(wCenter + barWidth, height - barHeight - marginBottom);
    ctx.lineTo(width, height - barHeight - marginBottom);
    ctx.lineTo(width, 0);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
}

// 둥근 사각형 배경 그리기
function drawRoundRect(ctx, x, y, width, height, radius, color) {
    if (width < 2 * radius) radius = width * 0.5;
    if (height < 2 * radius) radius = height * 0.5;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
}

// 텍스트 설정
function setText(ctx, x, y, value) {
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText(value, x, y);
}