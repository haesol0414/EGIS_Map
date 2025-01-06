/* POI 생성 함수 */
function createPOI(position, color, value, balloonType, subValue = null) {
    const currentState = getCurrentMouseState();

    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = (currentState === "altitude") ? 200 : 100;
    drawCanvas.height = 100;

    // 아이콘 이미지 데이터 생성
    const imageData = drawIcon(drawCanvas, color, value, balloonType, subValue);

    if (currentState === "altitude") {
        // 고도 측정 모드 처리
        const nIndex = GLOBAL.nIndex;

        if (Symbol.insertIcon("Icon" + nIndex, imageData, drawCanvas.width, drawCanvas.height)) {
            const icon = Symbol.getIcon("Icon" + nIndex);
            const poi = Module.createPoint("POI" + nIndex);

            poi.setPosition(position);    // 위치 설정
            poi.setIcon(icon);             // 아이콘 설정

            POILayer.addObject(poi, 0);    // 레이어에 객체 추가
            GLOBAL.nIndex++;               // 인덱스 증가
        }
    } else {
        if (currentState === "radius") {
            // 반경 측정 모드
            if (Symbol.insertIcon("Icon", imageData, drawCanvas.width, drawCanvas.height)) {
                const icon = Symbol.getIcon("Icon");
                const poi = Module.createPoint("POI");

                poi.setPosition(position);
                poi.setIcon(icon);          // 아이콘 설정

                POILayer.addObject(poi, 0); // 레이어에 객체 추가
            }
        } else {
            // 거리 또는 면적
            const layerList = new Module.JSLayerList(true);
            const layer = layerList.nameAtLayer("MEASURE_POI");

            const key = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;

            // 면적 측정 마우스 상태일 때만 기존 POI 삭제
            if (currentState === "area") {
                layer.removeAtKey(key);
            }

            const poi = Module.createPoint(key);
            poi.setPosition(position);
            poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
            layer.addObject(poi, 0);

            // 거리 측정 마우스 상태일 때만 객체 카운트 증가
            if (currentState === "distance") {
                GLOBAL.m_objcount++;
            }

            // 화면 다시 렌더링
            Module.XDRenderData();
        }
    }
}


// 아이콘 이미지 생성 함수
function drawIcon(canvas, color, value, balloonType = false, subValue = null) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (subValue !== null) {
        // 고도 측정 아이콘 그리기
        if (subValue === -1) {
            drawRoundRect(ctx, 50, 20, 100, 20, 5, color); // 객체 높이 값이 유효하지 않을 경우
        } else {
            drawRoundRect(ctx, 50, 5, 100, 35, 5, color);  // 객체 높이 값이 유효할 경우
            setText(ctx, canvas.width * 0.5, canvas.height * 0.2,
                '지면고도 : ' + setKilloUnit(subValue, 0.001, 0),
                "rgb(255, 255, 255)", "12px");
        }
        setText(ctx, canvas.width * 0.5, canvas.height * 0.2 + 15,
            '해발고도 : ' + setKilloUnit(value, 0.001, 0),
            "rgb(255, 255, 255)", "12px");

        // 위치 마커 그리기
        drawDot(ctx, canvas.width, canvas.height);
    } else {
        // 일반 아이콘 그리기
        if (balloonType) {
            drawBalloon(ctx, canvas.height * 0.5, canvas.width, canvas.height, 5, canvas.height * 0.25, color);
            setText(ctx, canvas.width * 0.5, canvas.height * 0.2, value, "rgb(0, 0, 0)", "16px");
        } else {
            drawRoundRect(ctx, 0, canvas.height * 0.3, canvas.width, canvas.height * 0.25, 5, color);
            setText(ctx, canvas.width * 0.5, canvas.height * 0.5, value, "rgb(0, 0, 0)", "16px");
        }
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

/* 위치 마커 그리기 */
function drawDot(ctx, width, height) {
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.arc(width * 0.5, height * 0.5, 2, 0, 2 * Math.PI, false);
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    ctx.stroke();
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
function setText(_ctx, _posX, _posY, _value, _color, _size) {
    var strText = "";

    // 텍스트 문자열 설정
    if (typeof _value == 'number') {
        strText = setKilloUnit(_value, 0.001, 0);
    } else {
        strText = _value;
    }

    // 텍스트 스타일 설정
    _ctx.font = `bold ${_size} sans-serif`;
    _ctx.textAlign = "center";
    _ctx.fillStyle = _color;

    // 텍스트 그리기
    _ctx.fillText(strText, _posX, _posY);
}

/* m/km 텍스트 변환 */
function setKilloUnit(_text, _meterToKilloRate, _decimalSize) {
    if (_decimalSize < 0) {
        _decimalSize = 0;
    }
    if (typeof _text == "number") {
        if (_text < 1.0 / (_meterToKilloRate * Math.pow(10, _decimalSize))) {
            _text = _text.toFixed(1).toString() + 'm';
        } else {
            _text = (_text * _meterToKilloRate).toFixed(2).toString() + '㎞';
        }
    }
    return _text;
}

// function setTextComma(str) {
//     str = String(str);
//     return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
// }

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
}

// 아이콘 초기화
function clearIcon() {
    if (POILayer == null) {
        return;
    }

    // 등록된 아이콘 리스트 제거
    var icon, poi;

    poi = POILayer.keyAtObject("POI");

    if (poi == null) {
        return;
    }

    icon = poi.getIcon();

    // 아이콘을 참조하는 POI 제거
    POILayer.removeAtKey("POI");

    // 심볼에서 아이콘 제거
    Symbol.deleteIcon(icon.getId());
}
