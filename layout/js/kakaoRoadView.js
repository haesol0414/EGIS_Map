let rv, rvClient, overlayOn = false;

// 로드뷰 초기화
export function initializeRoadview(rvContainer) {
    rv = new kakao.maps.Roadview(rvContainer); // 로드뷰 객체
    rvClient = new kakao.maps.RoadviewClient(); // 로드뷰 클라이언트 객체
}

// 로드뷰 오버레이 활성화/비활성화
export function toggleRoadviewOverlay(map) {
    if (overlayOn) {
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        overlayOn = false;
        console.log('로드뷰 오버레이 비활성화');
    } else {
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        overlayOn = true;
        console.log('로드뷰 오버레이 활성화');
    }
}

// 지도 클릭 시 로드뷰 열기
export function openRoadviewOnClick(map) {
    if (!overlayOn) return; // 로드뷰 모드가 활성화된 상태에서만 동작

    kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
        const position = mouseEvent.latLng;
        $(".map-range").hide();
        $("#close-roadview").show();

        // 클릭한 위치에서 가장 가까운 로드뷰 파노라마 ID 가져오기
        rvClient.getNearestPanoId(position, 50, function (panoId) {
            if (panoId) {
                rv.setPanoId(panoId, position); // 클릭한 위치의 로드뷰 설정
                $('#map').hide(); // 지도 숨기기
                $('#roadview-container').show(); // 로드뷰 표시
                addRoadviewMarker(position); // 마커 추가
            } else {
                alert('해당 위치에서는 로드뷰를 지원하지 않습니다.');
            }
        });
    });
}

// 로드뷰 닫기
export function closeRoadview() {
    $('#roadview-container').hide();
    $('#map').show();
    $(".map-range").show();
    $("#close-roadview").hide();
}

// 로드뷰 마커 추가
export function addRoadviewMarker(position) {
    const marker = new kakao.maps.Marker({
        position: position, // 마커 위치
        map: rv, // 로드뷰에 마커 추가
        draggable: true, // 마커 드래그 가능
    });

    kakao.maps.event.addListener(marker, 'click', function () {
        console.log("로드뷰 마커 클릭");
    });

    return marker; // 마커 객체 반환
}
