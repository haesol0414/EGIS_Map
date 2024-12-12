import {generateStars} from './utils/rating.js';

$(document).ready(function () {
    const apiKey = "4222cd468120fdc1a67d92b7f3190ce3";
    let map, markers = [];
    const mapContainer = $('#map')[0];
    const zoomSlider = $('#zoom-slider');
    let activeOverlay = null; // 현재 활성화된 오버레이
    let activeBadge = null; // 현재 활성화된 뱃지

    function initializeMapWithCurrentLocation() {
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

    function searchPlaces() {
        const keyword = $('#search-place').val().trim();

        if (!keyword) {
            alert('검색어를 입력하세요.');
            return;
        }

        if (isAddress(keyword)) {
            searchAddress(keyword);
        } else {
            $.ajax({
                url: `https://dapi.kakao.com/v2/local/search/keyword.json`,
                type: 'GET',
                headers: {Authorization: `KakaoAK ${apiKey}`},
                data: {
                    query: keyword,
                    x: map.getCenter().getLng(),
                    y: map.getCenter().getLat(),
                    radius: 3000,
                    size: 15
                },
                success: handleSearchSuccess,
                error: handleSearchError
            });
        }
    }

    function searchAddress(query) {
        $.ajax({
            url: `https://dapi.kakao.com/v2/local/search/address.json`,
            type: 'GET',
            headers: {Authorization: `KakaoAK ${apiKey}`},
            data: {query: query},
            success: handleSearchSuccess,
            error: handleSearchError
        });
    }

    function handleSearchSuccess(response) {
        if (response.documents.length === 0) {
            $('.search-result-info').html('<p class="no-result">검색 결과가 없습니다.</p>');
            $('.search-result').html('');
        } else {
            displayPlaces(response.documents);
        }
    }

    function handleSearchError(error) {
        console.error("Search Error: ", error);
        alert('장소 검색에 실패했습니다.');
    }

    function displayPlaces(places) {
        clearMarkers();

        let listHtml = '';
        const bounds = new kakao.maps.LatLngBounds();

        $('.search-result-info').html(`<p>검색 결과 총 ${places.length}건</p>`);

        places.forEach((place, index) => {
            const rating = (Math.random() * 4 + 1).toFixed(1);
            const position = new kakao.maps.LatLng(place.y, place.x);

            createMarker(position, index, place, rating);
            listHtml += createListItem(place, index, rating);
            bounds.extend(position);
        });

        $('.search-result').html(listHtml);
        map.setBounds(bounds);
    }

    function clearMarkers() {
        if (activeOverlay) activeOverlay.setMap(null);
        if (activeBadge) activeBadge.setMap(null);

        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }

    function createMarker(position, index, place, rating) {
        const markerContent = `
            <div class="marker" 
                style="width:30px; height:40px; 
                background:url('https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png') no-repeat; 
                background-size:cover; cursor: pointer;"
                data-index="${index}">
            </div>
        `;

        const marker = new kakao.maps.CustomOverlay({
            map: map,
            position: position,
            content: markerContent,
            yAnchor: 1,
        });

        const categoryName = place.category_name?.split(' > ').pop() || '';

        const overlayContent = `
        <div class="info-window">
              <div class="place-name">
                   <p class="info-title">${place.place_name}</p>
                   <span class="place-category">${categoryName}</span>
              </div>
            <div class="place-rating">
                ${generateStars(rating)}
                <span class="rating-value">${rating}</span>
            </div>
            <p class="info-road-address">${place.road_address_name || '도로명 주소 없음'}</p>
            <div class="info-address">
                <span class="sticker">지번</span>
                <span>${place.address_name || '지번 주소 없음'}</span>
            </div>
            <span class="info-tel">${place.phone || '전화번호 없음'}</span>
            <div class="service">
                <a href="${place.place_url}" target="_blank" class="info-detail">상세보기</a>
            </div>
        </div>
        `;

        const badgeContent = `
            <div class="badge">
                <span class="badge-idx">${String.fromCharCode(65 + index)}. </span>
              <span class="badge-title">${place.place_name}</span>
            </div>
        `;

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

        marker.overlay = overlay;
        marker.badge = badge;
        markers.push(marker);
    }

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

    function createListItem(place, index, rating) {
        const markerLabel = String.fromCharCode(65 + index);

        const isAddressSearch = place.address || place.road_address;

        const placeName = isAddressSearch
            ? (place.road_address?.building_name || '건물명 없음')
            : place.place_name;

        const roadAddress = isAddressSearch
            ? (place.road_address?.address_name || '도로명 주소 없음')
            : place.road_address_name;

        const addressName = isAddressSearch
            ? (place.address?.address_name || '지번 주소 없음')
            : place.address_name;

        const categoryName = place.category_name?.split(' > ').pop() || '';

        return `
            <li class="search-result-item" data-marker-index="${index}">
                <div class="place-title">
                    <span class="place-idx">${markerLabel}.</span>
                    <div class="place-name">
                        <span class="place-link">${placeName}</span>
                        <span class="place-category">${categoryName}</span>
                    </div>
                </div>
                <div class="place-rating">
                    ${generateStars(rating)}
                    <span class="rating-value">${rating}</span>
                </div>
                <p class="road-address-name">${roadAddress}</p>
                <p class="address-name">
                    <span class="sticker">지번</span>
                    ${addressName}</p>
                <div class="place-detail">
                    <p class="tel">${place.phone || '전화번호 없음'}</p>
                    <a href="${place.place_url}" target="_blank" class="detail-link">상세보기</a>
                </div>
            </li>
            `;
    }

    function bindZoomControlEvents() {
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
    }

    function bindSearchEvents() {
        $('#search-place').on('keypress', function (e) {
            if (e.key === 'Enter') {
                searchPlaces();
            }
        });
        $('.search-group .btn').on('click', searchPlaces);
    }

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

    function isAddress(keyword) {
        return /\d/.test(keyword) && /\s/.test(keyword);
    }

    initializeMapWithCurrentLocation();
    bindZoomControlEvents();
    bindSearchEvents();
});
