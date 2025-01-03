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

        // 렌더링 옵션 설정
        Module.getOption().SetAreaMeasurePolygonDepthBuffer(false);
        Module.getOption().SetDistanceMeasureLineDepthBuffer(false);

        // 콜백 함수 설정
        Module.getOption().callBackAddPoint(addPoint);
        Module.getOption().callBackCompletePoint(endPoint);

        console.log("XDWorld 엔진 로딩 완료");
    }
};
