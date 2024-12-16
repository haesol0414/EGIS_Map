let rv, rvClient, rvOverlayMarker;
let overlayOn = false;

// 로드뷰 초기화
export function initializeRoadview(rvContainer) {
    rv = new kakao.maps.Roadview(rvContainer); // 로드뷰 객체
    rvClient = new kakao.maps.RoadviewClient(); // 로드뷰 클라이언트 객체
}

// 로드뷰 오버레이 활성화/비활성화
export function toggleOverlay(map) {
    if (overlayOn) {
        // 로드뷰 오버레이 비활성화
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

        if (rvOverlayMarker) {
            rvOverlayMarker.setMap(null);
            rvOverlayMarker = null;
        }

        overlayOn = false;

        updateUIForRoadview(false); // UI 업데이트
        console.log('로드뷰 오버레이 비활성화');
    } else {
        // 로드뷰 오버레이 활성화
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

        addRoadviewOverlayMarker(map); // 마커 추가
        overlayOn = true;

        updateUIForRoadview(true); // UI 업데이트
        console.log('로드뷰 오버레이 활성화');
    }
}

// UI 상태 업데이트
function updateUIForRoadview(isActive) {
    if (isActive) {
        $(".map-menu .menu-cont").addClass("closed").removeClass("opened");
        $(".map-menu .menu-cont-btn").removeClass("on");
    } else {
        $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
        $(".map-menu .menu-cont-btn").addClass("on");
    }
}

// 로드뷰 닫기
export function closeRoadview() {
    $('#roadview-container').hide();
    $('#map').show();
    $("#close-roadview").hide();
}

// 로드뷰 마커 추가
export function addRoadviewOverlayMarker(map) {
    const center = map.getCenter(); // 현재 지도의 중심 좌표 (로드뷰 오버레이 중심 좌표와 동일)

    // 동동이 마커 이미지 생성
    const markerImage = new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
        new kakao.maps.Size(26, 46),
        {
            spriteSize: new kakao.maps.Size(1666, 168),
            spriteOrigin: new kakao.maps.Point(705, 114),
            offset: new kakao.maps.Point(13, 46)
        }
    );

    // 마커가 이미 존재하면 위치만 업데이트
    if (rvOverlayMarker) {
        rvOverlayMarker.setPosition(center); // 중심 좌표로 위치 업데이트
    } else {
        // 마커 생성
        rvOverlayMarker = new kakao.maps.Marker({
            position: center,
            image: markerImage,
            map: map,
            draggable: true,
            zIndex: 1000
        });

        // 드래그시 로드뷰 위치 업데이트
        kakao.maps.event.addListener(rvOverlayMarker, 'dragend', function () {
            const newPosition = rvOverlayMarker.getPosition(); // 드래그 종료 후 위치

            // 새로운 위치에서 가장 가까운 로드뷰 파노라마 ID 가져오기
            rvClient.getNearestPanoId(newPosition, 50, function (panoId) {
                if (panoId) {
                    rv.setPanoId(panoId, newPosition); // 로드뷰 업데이트
                    $('#map').hide();
                    $('#roadview-container').show();
                    $("#close-roadview").show();

                    console.log('로드뷰 위치가 업데이트되었습니다:', newPosition);
                } else {
                    alert('해당 위치에서는 로드뷰를 지원하지 않습니다.');
                }
            });
        });
    }
}

// 지도와 로드뷰 동기화 함수
export function syncMapAndRoadview(map) {
    // 지도 중심 변경 시 로드뷰 위치 업데이트
    // kakao.maps.event.addListener(map, 'center_changed', function () {
    //     const mapCenter = map.getCenter();
    //     rvClient.getNearestPanoId(mapCenter, 50, function (panoId) {
    //         if (panoId) {
    //             rv.setPanoId(panoId, mapCenter); // 로드뷰 위치 업데이트
    //         }
    //     });
    // });

    // 로드뷰 위치 변경 시 지도 중심 업데이트
    // kakao.maps.event.addListener(rv, 'position_changed', function () {
    //     const rvPosition = rv.getPosition();
    //     map.setCenter(rvPosition); // 지도 중심 업데이트
    // });
}
