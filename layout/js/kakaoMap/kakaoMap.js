import KakaoAPI from '../api/kakaoApi.js'
import {createMarkerHTML, createOverlayHTML, createBadgeHTML, createListItemHTML} from '../utils/htmlTemplates.js'
import {isAddress, getUserPosition} from '../utils/utils.js';
import {
    closeRoadView,
    initializeRoadview,
    showRoadView,
    toggleOverlay,
    updateInfoWindowPosition,
} from './kakaoRoadView.js';

$(document).ready(() => {
    let map, markers = [];
    const mapContainer = $('#map')[0];
    const zoomSlider = $('#zoom-slider');
    let activeOverlay = null;
    let activeBadge = null;

    const rvContainer = $('#roadview-container')[0];
    const rvToggle = $('#roadview');
    const closeRv = $('#close-roadview');

    // 현재 위치로 맵 초기화
    const initializeMap = () => {
        initializeRoadview(rvContainer);

        getUserPosition(
            (userPosition) => {
                const userLatLng = new kakao.maps.LatLng(userPosition.lat, userPosition.lng);

                if (!map) {
                    map = new kakao.maps.Map(mapContainer, {
                        center: userLatLng,
                        level: 3
                    });

                    kakao.maps.event.addListener(map, 'idle', bindMarkerEvents);
                    kakao.maps.event.addListener(map, 'zoom_changed', () => {
                        zoomSlider.val(map.getLevel());
                    });

                    const mapTypeControl = new kakao.maps.MapTypeControl();
                    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

                    const zoomControl = new kakao.maps.ZoomControl();
                    map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMRIGHT);
                } else {
                    map.setCenter(userLatLng);
                }
            },
            () => alert('현재 위치를 가져올 수 없습니다.')
        );
    };

    // 카테고리별 검색
    const searchPlacesByCategory = async (categoryCode) => {
        try {
            const position = {
                lat: map.getCenter().getLat(),
                lng: map.getCenter().getLng()
            };

            const response = await KakaoAPI.searchCategory(categoryCode, position);
            handleSearchSuccess(response);
        } catch (error) {
            handleSearchError(error);
        }
    };

    // 주소 또는 키워드로 검색
    const searchPlaces = async () => {
        const keyword = $('#search-place').val().trim();

        if (!keyword) {
            alert('검색어를 입력하세요.');
            return;
        }

        try {
            if (isAddress(keyword)) {
                const response = await KakaoAPI.searchAddress(keyword);
                handleSearchSuccess(response);
            } else {
                const position = {
                    lat: map.getCenter().getLat(),
                    lng: map.getCenter().getLng()
                };
                const response = await KakaoAPI.searchKeyword(keyword, position);
                handleSearchSuccess(response);
            }
        } catch (error) {
            handleSearchError(error);
        }
    };

    // 마커 및 오버레이 생성
    const createMarker = (position, index, place, rating) => {
        const badgeContent = createBadgeHTML(index, place);
        const markerContent = createMarkerHTML(index);
        const overlayContent = createOverlayHTML(place, rating);

        const marker = new kakao.maps.CustomOverlay({
            map: map,
            position: position,
            content: markerContent,
            yAnchor: 1,
        });

        const overlay = new kakao.maps.CustomOverlay({
            map: null,
            position: position,
            content: overlayContent,
            yAnchor: 1.4,
            zIndex: 1000
        });

        const badge = new kakao.maps.CustomOverlay({
            position: position,
            content: badgeContent,
            xAnchor: -0.2,
            yAnchor: 1.2,
            zIndex: 1000
        });

        markers.push(marker);
        marker.overlay = overlay;
        marker.badge = badge;
    };

    // 마커 및 오버레이 이벤트
    const bindMarkerEvents = () => {
        markers.forEach((marker, index) => {
            const badge = marker.badge;
            const overlay = marker.overlay;

            $(`.marker[data-index="${index}"]`).off('mouseover mouseout click').on({
                mouseover: () => {
                    if (activeBadge) activeBadge.setMap(null);
                    badge.setMap(map);
                    activeBadge = badge;
                },
                mouseout: () => {
                    badge.setMap(null);
                    activeBadge = null;
                },
                mousedown: (e) => e.preventDefault(),
                click: () => {
                    map.setCenter(marker.getPosition());
                    if (activeOverlay) activeOverlay.setMap(null);

                    if (activeOverlay === overlay) {
                        activeOverlay = null;
                    } else {
                        overlay.setMap(map);
                        activeOverlay = overlay;
                    }
                }
            });
        });
    };

    // 마커 초기화
    const clearMarkers = () => {
        if (activeOverlay) activeOverlay.setMap(null);
        if (activeBadge) activeBadge.setMap(null);

        markers.forEach(marker => marker.setMap(null));
        markers = [];
    };

    // 검색 리스트 표시
    const displayPlaces = (places) => {
        clearMarkers();

        let listHtml = '';
        const bounds = new kakao.maps.LatLngBounds();

        $('.search-result-info').html(`<p>검색 결과 총 ${places.length}건</p>`);

        places.forEach((place, index) => {
            const rating = (Math.random() * 4 + 1).toFixed(1);
            const position = new kakao.maps.LatLng(place.y, place.x);

            createMarker(position, index, place, rating);
            listHtml += createListItemHTML(place, index, rating);

            bounds.extend(position);
        });
        $('.search-result').html(listHtml);

        map.setBounds(bounds);
    };

    // 검색 성공 핸들링
    const handleSearchSuccess = (response) => {
        if (response.documents.length === 0) {
            $('.search-result-info').html('<p class="no-result">검색 결과가 없습니다.</p>');
            $('.search-result').html('');
        } else {
            displayPlaces(response.documents);
        }
    };

    // 에러 핸들링
    const handleSearchError = (error) => {
        console.error("Search Error: ", error);
        alert('장소 검색에 실패했습니다.');
    };

    // 맵 초기화
    initializeMap();

    /* ======== 이벤트 바인딩 ======== */
    $('#search-place').on('keypress', (e) => {
        if (e.key === 'Enter') searchPlaces();
    });

    $('.search-group .btn').on('click', searchPlaces);

    $('.kakao-map .category').on('click', function () {
        const categoryCode = $(this).data('category');

        $('.kakao-map .category').removeClass('active');
        $(this).addClass('active');

        searchPlacesByCategory(categoryCode);
    });

    $(rvToggle).on('click', () => toggleOverlay(map));

    $(closeRv).on('click', closeRoadView);

    $('#user-location').on('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const userPosition = new kakao.maps.LatLng(lat, lng);

                if (map) {
                    map.setCenter(userPosition);
                    map.setLevel(3);
                } else {
                    alert("지도가 초기화되지 않았습니다.");
                }
            }, error => {
                alert("현재 위치를 가져올 수 없습니다. 위치 서비스 사용을 허용해주세요.");
                console.error("Geolocation Error: ", error);
            });
        } else {
            alert("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    });

    $('.search-result').on('click', '.place-name', (e) => {
        e.preventDefault();

        const listItem = $(e.currentTarget).closest('.search-result-item');
        const markerIndex = listItem.data('marker-index');
        const marker = markers[markerIndex];
        const overlay = marker.overlay;

        if (marker) {
            const position = marker.getPosition();
            map.setCenter(position);

            if (activeOverlay) {
                activeOverlay.setMap(null);
                activeOverlay = null;
            }

            overlay.setMap(map);
            activeOverlay = overlay;
        }
    });

    $(document).on('click', (e) => {
        if (
            !$(e.target).closest('.info-window').length &&
            !$(e.target).closest('.marker').length &&
            !$(e.target).closest('.place-name').length
        ) {
            if (activeOverlay) {
                activeOverlay.setMap(null);
                activeOverlay = null;
            }
        }
    });

    $(document).on('click', '#info-roadview', function () {
        const lat = $(this).data('lat');
        const lng = $(this).data('lng');
        const title = $(this).data('title');

        const position = new kakao.maps.LatLng(lat, lng);

        showRoadView();
        updateInfoWindowPosition(position, title);
    });
});
