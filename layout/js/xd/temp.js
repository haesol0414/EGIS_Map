// var GLOBAL = {
//     Symbol: null,       // 아이콘 관리 심볼 객체
//     Layer: null,        // POI 저장 레이어
//     nIndex: 0           // POI와 아이콘을 생성할 때 사용하는 인덱스
// };
//
// var Module = {
//     locateFile: function (s) {
//         return "https://cdn.xdworld.kr/latest/" + s;
//     },
//     postRun: function () {
//         Module.initialize({
//             container: document.getElementById("xd-map"),
//             terrain: {
//                 dem: {
//                     url: "https://xdworld.vworld.kr",
//                     name: "dem",
//                     servername: "XDServer3d",
//                     encoding: true
//                 },
//                 image: {
//                     url: "https://xdworld.vworld.kr",
//                     name: "tile",
//                     servername: "XDServer3d"
//                 }
//             },
//             defaultKey: "DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I=="
//         });
//
//         // 카메라 위치 설정
//         Module.getViewCamera().look(
//             new Module.JSVector3D(126.93831646026437, 37.517164463389214, 629.4693173738196), // 카메라 위치
//             new Module.JSVector3D(126.93866761878483, 37.52295801173619, 10.460245016030967)  // 카메라가 바라보는 위치
//         );
//
//         // 건물 렌더링 가시 범위 증가 (테스트 목적으로 설정)
//         Module.setVisibleRange("facility_build", parseFloat(5), 300000);
//
//         // 아이콘 관리 심볼 생성
//         GLOBAL.Symbol = Module.getSymbol();
//
//         // 분석 결과 POI 레이어 생성
//         var layerList = new Module.JSLayerList(true);
//         GLOBAL.Layer = layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);
//         GLOBAL.Layer.setMaxDistance(20000.0);
//         GLOBAL.Layer.setSelectable(false);
//
//         // XDServer 레이어 생성 (건물 데이터 로드)
//         Module.getTileLayerList().createXDServerLayer({
//             url: "https://xdworld.vworld.kr",
//             servername: "XDServer3d",
//             name: "facility_build",
//             type: 9,
//             minLevel: 0,
//             maxLevel: 15
//         });
//
//         // 건물 렌더링 가시 범위 증가 (테스트 목적으로 설정)
//         Module.setVisibleRange("facility_build", parseFloat(5), 300000);
//
//         // 고도 측정 이벤트 추가
//         Module.canvas.addEventListener("Fire_EventAddAltitudePoint", function (e) {
//             createAltiPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt),
//                 "rgba(10, 10, 0, 0.5)",
//                 e.dGroundAltitude, e.dObjectAltitude);
//         });
//     }
// };
//
// /* 분석 결과 POI 생성 */
// function createPOI(_position, _color, _value, _subValue) {
//     // POI 아이콘 이미지를 그리기 위한 캔버스 생성
//     var drawCanvas = document.createElement('canvas');
//     drawCanvas.width = 200;
//     drawCanvas.height = 100;
//
//     // 아이콘 이미지 데이터 가져오기
//     var imageData = drawIcon(drawCanvas, _color, _value, _subValue),
//         nIndex = GLOBAL.nIndex;
//
//     // 심볼에 아이콘 이미지 등록
//     if (GLOBAL.Symbol.insertIcon("Icon" + nIndex, imageData, drawCanvas.width, drawCanvas.height)) {
//
//         // 등록된 아이콘 객체 가져오기
//         var icon = GLOBAL.Symbol.getIcon("Icon" + nIndex);
//
//         // JSPoint 객체 생성
//         var count = GLOBAL.Layer.getObjectCount(),
//             poi = Module.createPoint("POI" + nIndex);
//
//         poi.setPosition(_position);    // 위치 설정
//         poi.setIcon(icon);             // 아이콘 설정
//
//         // 레이어에 객체 추가
//         GLOBAL.Layer.addObject(poi, 0);
//
//         // 인덱스 값 증가
//         GLOBAL.nIndex++;
//     }
// }
//
// /* 아이콘 이미지 데이터 반환 */
// function drawIcon(_canvas, _color, _value, _subValue) {
//     // 컨텍스트 가져오기 및 배경 초기화
//     var ctx = _canvas.getContext('2d'),
//         width = _canvas.width,
//         height = _canvas.height;
//     ctx.clearRect(0, 0, width, height);
//
//     // 배경과 높이 값 텍스트 그리기
//     if (_subValue == -1) {
//         drawRoundRect(ctx, 50, 20, 100, 20, 5, _color);    // 객체 높이 값이 유효하지 않을 경우
//
//     } else {
//         drawRoundRect(ctx, 50, 5, 100, 35, 5, _color);     // 객체 높이 값이 유효할 경우
//         setText(ctx, width * 0.5, height * 0.2, '지면고도 : ' + setKilloUnit(_subValue, 0.001, 0));
//     }
//     setText(ctx, width * 0.5, height * 0.2 + 15, '해발고도 : ' + setKilloUnit(_value, 0.001, 0));
//
//     // 위치 마커 그리기
//     drawDot(ctx, width, height);
//
//     return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
// }
//
// /* 위치 마커 그리기 */
// function drawDot(ctx, width, height) {
//     ctx.beginPath();
//     ctx.lineWidth = 6;
//     ctx.arc(width * 0.5, height * 0.5, 2, 0, 2 * Math.PI, false);
//     ctx.closePath();
//
//     ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
//     ctx.fill();
//     ctx.lineWidth = 8;
//     ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
//     ctx.stroke();
// }
//
// /* 둥근 사각형 배경 그리기 */
// function drawRoundRect(ctx,
//                        x, y,
//                        width, height, radius,
//                        color) {
//     if (width < 2 * radius) radius = width * 0.5;
//     if (height < 2 * radius) radius = height * 0.5;
//
//     ctx.beginPath();
//     ctx.moveTo(x + radius, y);
//     ctx.arcTo(x + width, y, x + width, y + height, radius);
//     ctx.arcTo(x + width, y + height, x, y + height, radius);
//     ctx.arcTo(x, y + height, x, y, radius);
//     ctx.arcTo(x, y, x + width, y, radius);
//     ctx.closePath();
//
//     // 사각형 그리기
//     ctx.fillStyle = color;
//     ctx.fill();
//
//     return ctx;
// }
//
// /* 텍스트 그리기 */
// function setText(_ctx, _posX, _posY, _strText) {
//     _ctx.font = "bold 12px sans-serif";
//     _ctx.textAlign = "center";
//
//     _ctx.fillStyle = "rgb(255, 255, 255)";
//     _ctx.fillText(_strText, _posX, _posY);
// }
//
// /* 분석 내용 초기화 */
// function clearAnalysis() {
//     var layer = GLOBAL.Layer,
//         symbol = GLOBAL.Symbol;
//     if (layer == null) {
//         return;
//     }
//
//     // 등록된 아이콘 리스트 제거
//     var i, len,
//         icon, poi;
//     for (i = 0, len = layer.getObjectCount(); i < len; i++) {
//
//         poi = layer.keyAtObject("POI" + i);
//         icon = poi.getIcon();
//
//         // 아이콘을 참조하는 POI 제거
//         layer.removeAtKey("POI" + i);
//
//         // 심볼에서 아이콘 제거
//         symbol.deleteIcon(icon.getId());
//     }
//
//     // POI 및 아이콘 키 인덱스 초기화
//     GLOBAL.nIndex = 0;
// }
//
// /* m/km 텍스트 변환 */
// function setKilloUnit(_text, _meterToKilloRate, _decimalSize) {
//     if (_decimalSize < 0) {
//         _decimalSize = 0;
//     }
//     if (typeof _text == "number") {
//         if (_text < 1.0 / (_meterToKilloRate * Math.pow(10, _decimalSize))) {
//             _text = _text.toFixed(1).toString() + 'm';
//         } else {
//             _text = (_text * _meterToKilloRate).toFixed(2).toString() + '㎞';
//         }
//     }
//     return _text;
// }
//
// const altitudeBtn = document.getElementById("altitude-btn");
// altitudeBtn.addEventListener("click", () => {
//     altitudeBtn.classList.add("active");
//     Module.XDSetMouseState(Module.MML_ANALYS_ALTITUDE); // 고도 측정 모드
//
//     console.log("고도 측정");
// });
//
