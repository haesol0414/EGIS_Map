// 거리 측정 버튼 가져오기
const distanceBtn = document.getElementById("distance-btn");

// 전역 변수 설정
var GLOBAL = {
    m_objcount: 0, // 측정 오브젝트(POI)의 개수
    m_mercount: 0  // 측정 작업의 총 개수
};

// XDWorld 모듈 설정
var Module = {
    locateFile: function (s) {
        return "https://cdn.xdworld.kr/latest/" + s;
    },
    postRun: function () {
        // XDWorld 엔진 초기화
        Module.initialize({
            container: document.getElementById("xd-map"), // 지도 컨테이너
            terrain: { // 지형 데이터 설정
                dem: {
                    url: "https://xdworld.vworld.kr",
                    name: "dem",
                    servername: "XDServer3d",
                    encoding: true
                },
                image: { // 지형 이미지 설정
                    url: "https://xdworld.vworld.kr",
                    name: "tile",
                    servername: "XDServer3d"
                }
            },
            defaultKey: "DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I=="
        });

        // 카메라 초기 위치 설정
        Module.XDSetCamPositionLonLat(128.555323, 35.814567, 1000000, 90);

        // 거리 측정 초기화
        initDistanceMeasurement();
    }
};

// 거리 측정 초기화 함수
function initDistanceMeasurement() {
    // 거리 측정을 위한 레이어 생성
    let layerList = new Module.JSLayerList(true);
    layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);

    // 거리 측정 시 라인의 깊이 테스트 비활성화
    Module.getOption().SetDistanceMeasureLineDepthBuffer(false);

    // 거리 측정 시 콜백 함수 연결
    Module.getOption().callBackAddPoint(addPoint); // 점 추가 시 호출
    Module.getOption().callBackCompletePoint(endPoint); // 측정 완료(더블 클릭) 시 호출
}

// 거리 측정 모드 토글
distanceBtn.addEventListener("click", () => {
    const currentState = distanceBtn.getAttribute("data-state");

    if (currentState === "measure") {
        // 거리 측정 모드 해제
        setMouseState("move");
        distanceBtn.setAttribute("data-state", "move");
    } else {
        // 거리 측정 모드 활성화
        setMouseState("measure");
        distanceBtn.setAttribute("data-state", "measure");
    }
});

// 거리 측정 데이터 초기화
function clearAllMeasurements() {
    // POI 데이터 및 레이어 삭제
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");

    if (layer) {
        layer.removeAll(); // 레이어의 모든 객체 삭제
    }

    Module.XDClearDistanceMeasurement();

    // UI 리스트 초기화
    const objList = document.getElementById("objList");
    while (objList.firstChild) {
        objList.removeChild(objList.firstChild);
    }

    // 전역 변수 초기화
    GLOBAL.m_objcount = 0;
    GLOBAL.m_mercount = 0;

    // 화면 다시 렌더링
    Module.XDRenderData();
}


// 점 추가 콜백 함수 (거리 측정 중에 점이 추가될 때 실행)
function addPoint(e) {
    if (e.dDistance > 0.01) {
        // 두 점 간 거리 출력
        console.log(`두 점 간 거리: ${e.dDistance.toFixed(2)}m`);

        // 중간 지점에 두 점 간 거리 표시
        createPOI(
            new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt),
            "rgba(255, 255, 0, 0.8)",
            `${e.dDistance.toFixed(2)}m`,
            false
        );
    }

    // 총 거리 출력
    console.log(`총 거리: ${e.dTotalDistance.toFixed(2)}m`);
    // 총 거리를 마지막 지점에 표시
    createPOI(
        new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
        "rgba(255, 204, 198, 0.8)",
        `${e.dTotalDistance.toFixed(2)}m`,
        true
    );
}

// 거리 측정 완료 콜백 함수
function endPoint(e) {
    console.log("거리 측정 완료");
    viewListOBjKey(e); // 측정된 객체를 UI 리스트에 추가
    GLOBAL.m_mercount++; // 총 측정 작업 수 증가
}

// 마우스 상태 변경
function setMouseState(type) {
    if (type === "move") {
        Module.XDSetMouseState(Module.MML_MOVE_GRAB); // 이동 모드로 변경
    } else if (type === "measure") {
        Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT); // 거리 측정 모드로 변경
    }
}

// POI 생성 함수
function createPOI(position, color, value, balloonType) {
    // POI 이미지를 그릴 Canvas 생성
    const drawCanvas = document.createElement("canvas");
    drawCanvas.width = 100;
    drawCanvas.height = 100;

    // 아이콘 이미지를 그려서 데이터 반환
    const imageData = drawIcon(drawCanvas, color, value, balloonType);

    // POI 레이어에 아이콘 추가
    const layerList = new Module.JSLayerList(true);
    const layer = layerList.nameAtLayer("MEASURE_POI");

    // POI 생성 및 설정
    const poi = Module.createPoint(`${GLOBAL.m_mercount}_POI_${GLOBAL.m_objcount}`);
    poi.setPosition(position);
    poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
    layer.addObject(poi, 0);

    // 생성된 POI 수 증가
    GLOBAL.m_objcount++;
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

// 측정된 객체를 UI 리스트에 추가
function viewListOBjKey(key) {
    const cell = document.getElementById("objList");
    const li = document.createElement("li");

    li.id = key;
    li.innerHTML = `<a href='#' onclick="deleteObject('${key}');">${key}</a>`;
    cell.appendChild(li);
}

// 측정된 객체 삭제
function deleteObject(_key) {
    // XDWorld에서 거리 측정 객체 삭제
    Module.XDClearDistanceObject(_key);

    // UI에서 리스트 항목 삭제
    let li = document.getElementById(_key);
    if (li) li.remove();

    // POI 레이어에서 관련 객체 삭제
    let layerList = new Module.JSLayerList(true);
    let layer = layerList.nameAtLayer("MEASURE_POI");
    if (layer) {
        // 레이어에 있는 모든 객체의 키를 가져옴
        let list = layer.getObjectKeyList();

        // _key에 매칭되는 객체 키 삭제
        let key = _key.replace(/[^0-9]/g, '') + "_POI_"; // 객체 키 패턴 생성
        let strlist = list.split(",");
        strlist.forEach((item) => {
            if (item.indexOf(key) !== -1) {
                layer.removeAtKey(item); // 레이어에서 해당 키를 가진 객체 삭제
            }
        });
    }

    // 화면 다시 렌더링
    Module.XDRenderData();
}