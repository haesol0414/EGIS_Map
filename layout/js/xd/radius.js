let Symbol, // 아이콘 관리 심볼 객체
    POILayer, // POI 저장 레이어
    WallLayer; // 반경 벽 저장 레이어

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

        // 반경 이벤트 설정
        Module.canvas.addEventListener("Fire_EventAddRadius", function (e) {
            if (e.dTotalDistance > 0) {
                // POI 객체 초기화
                radiusclearIcon();

                // 반경 POI 객체 생성
                radiuscreatePOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true);
            }
        });

        // 카메라 위치 설정
        Module.getViewCamera().setLocation(new Module.JSVector3D(126.92836647767662, 37.52439503321471, 1000.0));

        // 아이콘 관리 심볼 생성
        Symbol = Module.getSymbol();

        // 분석 내용을 표시할 POI 레이어 생성
        var layerList = new Module.JSLayerList(true);
        POILayer = layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);
        POILayer.setMaxDistance(20000.0);
        POILayer.setSelectable(false);

        WallLayer = layerList.createLayer("MEASURE_WALL", Module.ELT_POLYHEDRON);
        WallLayer.setMaxDistance(20000.0);
        WallLayer.setSelectable(false);
        WallLayer.setEditable(true);
    }
};

