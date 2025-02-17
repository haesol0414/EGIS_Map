let rv, rvClient, rvOverlayMarker, rvCustomMarker, rvInfoWindow;
let overlayOn = false;

// 로드뷰 초기화
export const initializeRoadview = (rvContainer) => {
	rv = new kakao.maps.Roadview(rvContainer); // 로드뷰 객체
	rvClient = new kakao.maps.RoadviewClient(); // 로드뷰 클라이언트 객체

	// 로드뷰 위치 변경 이벤트
	kakao.maps.event.addListener(rv, 'position_changed', () => {
		const position = rv.getPosition();

		if (rvOverlayMarker) {
			rvOverlayMarker.setPosition(position); // 로드뷰 위치에 따라 마커 위치 업데이트
		}
	});
};

// 로드뷰 오버레이 활성화/비활성화
export const toggleOverlay = (map) => {
	if (overlayOn) {
		// 로드뷰 오버레이 비활성화
		map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

		if (rvOverlayMarker) {
			rvOverlayMarker.setMap(null);
			rvOverlayMarker = null;
		}

		overlayOn = false;
		console.log('로드뷰 오버레이 비활성화');
	} else {
		// 로드뷰 오버레이 활성화
		map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

		addRoadviewOverlayMarker(map);

		overlayOn = true;
		console.log('로드뷰 오버레이 활성화');
	}
};

// 로드뷰 오버레이 마커
export const addRoadviewOverlayMarker = (map) => {
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
		// 동동이 마커 생성
		rvOverlayMarker = new kakao.maps.Marker({
			position: center,
			image: markerImage,
			map: map,
			draggable: true,
			zIndex: 1000
		});

		// 드래그시 로드뷰 위치 업데이트
		kakao.maps.event.addListener(rvOverlayMarker, 'dragend', () => {
			const newPosition = rvOverlayMarker.getPosition(); // 드래그 종료 후 위치

			// 새로운 위치에서 가장 가까운 로드뷰 파노라마 ID 가져오기
			rvClient.getNearestPanoId(newPosition, 50, (panoId) => {
				if (panoId) {
					rv.setPanoId(panoId, newPosition); // 로드뷰 업데이트
					showRoadView();

					console.log('로드뷰 위치가 업데이트되었습니다:', newPosition);
				} else {
					alert('해당 위치에서는 로드뷰를 지원하지 않습니다.');
				}
			});
		});
	}
};

// 커스텀 오버레이에서 로드뷰 버튼 클릭 시 마커 설정
export const updateInfoWindowPosition = (position, placeName) => {
	if (rvCustomMarker) {
		rvCustomMarker.setMap(null); // 기존 마커 제거
		rvCustomMarker = null;
	}

	if (rvInfoWindow) {
		rvInfoWindow.setMap(null); // 기존 인포윈도우 제거
		rvInfoWindow = null;
	}

	// 로드뷰 파노라마 ID 가져오기
	rvClient.getNearestPanoId(position, 50, (panoId) => {
		if (panoId) {
			rv.setPanoId(panoId, position); // 로드뷰 설정
			showRoadView();

			// 새로운 로드뷰 마커 생성
			rvCustomMarker = new kakao.maps.Marker({
				position: position,
				map: rv
			});

			// 새로운 인포윈도우 생성
			rvInfoWindow = new kakao.maps.CustomOverlay({
				position: position,
				map: rv,
				content: `
                    <div class="rv-info-window" tabindex="-1">
                        <span class="rv-info-window-title">${placeName}</span>
                    </div>
                `,
				yAnchor: 2.4,
				zIndex: 5
			});
		} else {
			alert('해당 위치에서는 로드뷰를 지원하지 않습니다.');
		}
	});
};

export const showRoadView = () => {
	$('.map-menu .menu-cont').addClass('closed').removeClass('opened');
	$('.map-menu .menu-cont-btn, #user-location, #roadview').hide();
	$('#map').hide();
	$('#roadview-container, #close-roadview').show();
};

export const closeRoadView = () => {
	$('.map-menu .menu-cont').addClass('opened').removeClass('closed');
	$('.map-menu .menu-cont-btn, #user-location, #roadview').show();
	$('#roadview-container, #close-roadview').hide();
	$('#map').show();
};
