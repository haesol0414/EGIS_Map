/* POI 생성 함수 */
function createPOI(_position, _color, _value, _balloonType, _subValue = null) {
    const currentState = getCurrentMouseState();

    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = (currentState === "altitude") ? 200 : 100;
    drawCanvas.height = 100;

    // 아이콘 이미지 데이터 생성
    const imageData = drawIcon(drawCanvas, _color, _value, _balloonType, _subValue);

    if (currentState === "altitude") {
        // 고도 측정 POI 추가
        const nIndex = GLOBAL.n_index;

        if (Symbol.insertIcon("Icon" + nIndex, imageData, drawCanvas.width, drawCanvas.height)) {
            const icon = Symbol.getIcon("Icon" + nIndex);
            const poi = Module.createPoint("POI" + nIndex);

            poi.setPosition(_position);    // 위치 설정
            poi.setIcon(icon);             // 아이콘 설정

            POILayer.addObject(poi, 0);    // 레이어에 객체 추가

            GLOBAL.n_index++;               // 인덱스 증가
        }
    } else {
        if (currentState === "radius") {
            // 반경 측정 POI 추가
            if (Symbol.insertIcon("Icon", imageData, drawCanvas.width, drawCanvas.height)) {
                const icon = Symbol.getIcon("Icon");
                const poi = Module.createPoint("POI");

                poi.setPosition(_position);
                poi.setIcon(icon);          // 아이콘 설정

                POILayer.addObject(poi, 0); // 레이어에 객체 추가
            }
        } else {
            // 거리 또는 면적 POI 추가
            const key = `${GLOBAL.m_mercount}_${GLOBAL.m_objcount}_POI`;

            // 면적 측정 마우스 상태일 때만 기존 POI 삭제
            if (currentState === "area") {
                POILayer.removeAtKey(key);
            }

            const poi = Module.createPoint(key);
            poi.setPosition(_position);
            poi.setImage(imageData, drawCanvas.width, drawCanvas.height);

            POILayer.addObject(poi, 0); // 레이어에 객체 추가

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
function drawIcon(_canvas, _color, _value, _balloonType = false, _subValue = null) {
    const ctx = _canvas.getContext("2d");
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    if (_subValue !== null) {
        // 고도 측정 시
        if (_subValue === -1) {
            drawRoundRect(ctx, 50, 20, 100, 20, 5, _color); // 객체 높이 값이 유효하지 않을 경우
        } else {
            drawRoundRect(ctx, 50, 5, 100, 35, 5, _color);  // 객체 높이 값이 유효할 경우
            setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2,
                '지면고도 : ' + setKilloUnit(_subValue, 0.001, 0),
                "rgb(255, 255, 255)", "12px");
        }
        setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2 + 15,
            '해발고도 : ' + setKilloUnit(_value, 0.001, 0),
            "rgb(255, 255, 255)", "12px");

        // 위치 마커 그리기
        drawDot(ctx, _canvas.width, _canvas.height);
    } else {
        if (_balloonType) {
            drawBalloon(ctx, _canvas.height * 0.5, _canvas.width, _canvas.height, 5, _canvas.height * 0.25, _color);
            setText(ctx, _canvas.width * 0.5, _canvas.height * 0.2, _value, "rgb(0, 0, 0)", "16px");
        } else {
            drawRoundRect(ctx, 0, _canvas.height * 0.3, _canvas.width, _canvas.height * 0.25, 5, _color);
            setText(ctx, _canvas.width * 0.5, _canvas.height * 0.5, _value, "rgb(0, 0, 0)", "16px");
        }
    }

    return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
}

// 고도 측정시 점 그리기
function drawDot(_ctx, _width, _height) {
    _ctx.beginPath();
    _ctx.lineWidth = 6;
    _ctx.arc(_width * 0.5, _height * 0.5, 2, 0, 2 * Math.PI, false);
    _ctx.closePath();

    _ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    _ctx.fill();
    _ctx.lineWidth = 8;
    _ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    _ctx.stroke();
}

// 말풍선 형태의 배경 그리기
function drawBalloon(_ctx, _marginBottom, _width, _height, _barWidth, _barHeight, _color) {
    const wCenter = _width * 0.5;

    _ctx.beginPath();
    _ctx.moveTo(0, 0);
    _ctx.lineTo(0, _height - _barHeight - _marginBottom);
    _ctx.lineTo(wCenter - _barWidth, _height - _barHeight - _marginBottom);
    _ctx.lineTo(wCenter, _height - _marginBottom);
    _ctx.lineTo(wCenter + _barWidth, _height - _barHeight - _marginBottom);
    _ctx.lineTo(_width, _height - _barHeight - _marginBottom);
    _ctx.lineTo(_width, 0);
    _ctx.closePath();

    _ctx.fillStyle = _color;
    _ctx.fill();
}

// 둥근 사각형 배경 그리기
function drawRoundRect(_ctx, _x, _y, _width, _height, _radius, _color) {
    if (_width < 2 * _radius) _radius = _width * 0.5;
    if (_height < 2 * _radius) _radius = _height * 0.5;

    _ctx.beginPath();
    _ctx.moveTo(_x + _radius, _y);
    _ctx.arcTo(_x + _width, _y, _x + _width, _y + _height, _radius);
    _ctx.arcTo(_x + _width, _y + _height, _x, _y + _height, _radius);
    _ctx.arcTo(_x, _y + _height, _x, _y, _radius);
    _ctx.arcTo(_x, _y, _x + _width, _y, _radius);
    _ctx.closePath();

    _ctx.fillStyle = _color;
    _ctx.fill();
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

// m/km 텍스트 변환
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

// 면적 측정 - 단위 끊어내기
function setTextComma(_str) {
    const str = String(_str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

// 측정된 오브젝트 UI 리스트에 추가
function viewListOBjKey(_key) {
    const objList = document.getElementById("xd-object-list");
    const obj = document.createElement("li");

    obj.id = _key;
    obj.textContent = _key;
    obj.classList.add("xd-object");

    // 삭제 버튼 생성
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.classList.add("xd-del-btn");

    deleteBtn.addEventListener("click", () => {
        deleteObject(_key);
    });

    obj.appendChild(deleteBtn); // 리스트 항목에 삭제 버튼 추가
    objList.appendChild(obj); // 리스트에 항목 추가
}


// 오브젝트 개별 삭제
function deleteObject(_key) {
    const currentState = getCurrentMouseState();

    if (POILayer) {
        let list = POILayer.getObjectKeyList();
        let poiKeyPattern = `${_key.match(/\d+/g)?.[0]}_`;

        // 레이어의 키와 매칭하여 삭제
        let strlist = list.split(",");
        strlist.forEach((item) => {
            if (item.startsWith(poiKeyPattern)) {
                POILayer.removeAtKey(item);
                console.log("오브젝트 삭제:", item);
            }
        });

        document.getElementById(_key).remove();
    } else {
        console.warn("POI 레이어를 찾을 수 없음");
    }

    if (currentState === "distance") {
        Module.XDClearDistanceObject(_key); // 거리 객체 초기화
    } else if (currentState === "area") {
        Module.XDClearAreaObject(_key); // 면적 객체 초기화
    }

    Module.XDRenderData(); // 화면 다시 렌더링
}

// 반경 측정 - 아이콘 삭제
function clearIcon() {
    if (GLOBAL.POILayer == null) {
        return;
    }

    // 등록된 아이콘 리스트 삭제
    var icon, poi;

    poi = GLOBAL.POILayer.keyAtObject("POI");

    if (poi == null) {
        return;
    }

    icon = poi.getIcon();

    // 아이콘을 참조 중인 POI 삭제
    GLOBAL.POILayer.removeAtKey("POI");

    // 아이콘을 심볼에서 삭제
    GLOBAL.Symbol.deleteIcon(icon.getId());
}
