import KakaoAPI from './api/kakaoApi.js'
import {createMarkerHTML, createOverlayHTML, createBadgeHTML, createListItemHTML} from './utils/kakaoUi.js'
import {isAddress} from './utils/kakaoUtils.js';

$(document).ready(function () {
    let map, markers = [];
    const mapContainer = $('#map')[0];
    const zoomSlider = $('#zoom-slider');
    let activeOverlay = null;
    let activeBadge = null;

    // 맵 초기화
    function initializeMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const userPosition = new kakao.maps.LatLng(lat, lng);

                if (!map) {
                    map = new kakao.maps.Map(mapContainer, {
                        center: userPosition,
                        level: 3
                    });

                    kakao.maps.event.addListener(map, 'idle', bindMarkerEvents);
                    kakao.maps.event.addListener(map, 'zoom_changed', () => {
                        zoomSlider.val(map.getLevel());
                    });
                } else {
                    map.setCenter(userPosition);
                }

                console.log(`위도 ${lat}, 경도 ${lng}`);
            }, error => {
                alert("현재 위치를 가져올 수 없습니다. 위치 서비스 사용을 허용해주세요.");
                console.error("Geolocation Error: ", error);
            });
        } else {
            alert("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    }


    // 카테고리별 검색
    function searchPlacesByCategory(categoryCode) {
        const position = {
            lat: map.getCenter().getLat(),
            lng: map.getCenter().getLng()
        };

        KakaoAPI.searchCategory(categoryCode, position, handleSearchSuccess, handleSearchError);
    }


    // 장소 검색
    function searchPlaces() {
        const keyword = $('#search-place').val().trim();

        if (!keyword) {
            alert('검색어를 입력하세요.');
            return;
        }

        const position = {
            lat: map.getCenter().getLat(),
            lng: map.getCenter().getLng()
        };

        if (isAddress(keyword)) {
            KakaoAPI.searchAddress(keyword, handleSearchSuccess, handleSearchError);
        } else {
            KakaoAPI.searchKeyword(keyword, position, handleSearchSuccess, handleSearchError);
        }
    }


    // 마커 및 오버레이 생성
    function createMarker(position, index, place, rating) {
        const markerContent = createMarkerHTML(index);
        const overlayContent = createOverlayHTML(place, rating);
        const badgeContent = createBadgeHTML(index, place);

        const marker = new kakao.maps.CustomOverlay({
            map: map,
            position: position,
            content: markerContent,
            yAnchor: 1,
        });

        const overlay = new kakao.maps.CustomOverlay({
            position: position,
            content: overlayContent,
            yAnchor: 1.4,
            zIndex: 2
        });

        const badge = new kakao.maps.CustomOverlay({
            position: position,
            content: badgeContent,
            xAnchor: -0.2,
            yAnchor: 1.2,
            zIndex: 4
        });

        markers.push(marker);
        marker.overlay = overlay;
        marker.badge = badge;
    }


    // 마커 및 오버레이 이벤트
    function bindMarkerEvents() {
        markers.forEach((marker, index) => {
            const badge = marker.badge;
            const overlay = marker.overlay;

            $(`.marker[data-index="${index}"]`).off('mouseover mouseout click').on({
                mouseover: function () {
                    if (activeBadge) activeBadge.setMap(null);
                    badge.setMap(map);
                    activeBadge = badge;
                },
                mouseout: function () {
                    badge.setMap(null);
                    activeBadge = null;
                },
                click: function () {
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
    }

    // 마커 초기화
    function clearMarkers() {
        if (activeOverlay) activeOverlay.setMap(null);
        if (activeBadge) activeBadge.setMap(null);

        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }

    // 화면 그리기
    function displayPlaces(places) {
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
    }

    // 검색 성공 핸들링
    function handleSearchSuccess(response) {
        if (response.documents.length === 0) {
            $('.search-result-info').html('<p class="no-result">검색 결과가 없습니다.</p>');
            $('.search-result').html('');
        } else {
            displayPlaces(response.documents);
        }
    }

    // 에러 핸들링
    function handleSearchError(error) {
        console.error("Search Error: ", error);
        alert('장소 검색에 실패했습니다.');
    }



    initializeMap();


    /* 이벤트 바인딩 */
    
    // 지도 확대 축소
    $('.range-btn.zoomin').on('click', function () {
        let currentLevel = map.getLevel();
        if (currentLevel > 1) {
            map.setLevel(currentLevel - 1);
            zoomSlider.val(map.getLevel());
        }
    });

    $('.range-btn.zoomout').on('click', function () {
        let currentLevel = map.getLevel();
        if (currentLevel < 10) {
            map.setLevel(currentLevel + 1);
            zoomSlider.val(map.getLevel());
        }
    });

    
    // 검색
    $('#search-place').on('keypress', function (e) {
        if (e.key === 'Enter') {
            searchPlaces();
        }
    });

    $('.search-group .btn').on('click', searchPlaces);

    $('.category-group .category').on('click', function () {
        const categoryCode = $(this).data('category');
        searchPlacesByCategory(categoryCode);
    });
    

    // 오버레이 닫기
    $(document).on('click', function (e) {
        if (
            !$(e.target).closest('.info-window').length &&
            !$(e.target).closest('.marker').length
        ) {
            if (activeOverlay) {
                activeOverlay.setMap(null);
                activeOverlay = null;
            }
        }
    });

    
    // 현재 위치 이동 
    $('.map-tool-btn.location').on('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const userPosition = new kakao.maps.LatLng(lat, lng);

                if (map) {
                    map.setCenter(userPosition); // 현재 위치로 지도 중심 이동
                    map.setLevel(3); // 줌 레벨 조정
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
});
