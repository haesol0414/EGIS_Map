import {generateStars} from './utils/rating.js';

$(document).ready(function () {
    const apiKey = "4222cd468120fdc1a67d92b7f3190ce3";
    let map, markers = [];
    const mapContainer = $('#map')[0];
    const zoomSlider = $('#zoom-slider');

    // 현재 위치로 지도 초기화
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

                    kakao.maps.event.addListener(map, 'zoom_changed', () => {
                        zoomSlider.val(map.getLevel());
                    });
                } else {
                    map.setCenter(userPosition);
                }

                console.log(`위도 ${lat}, 경도 ${lng}`);
            }, handleError);
        } else {
            alert("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    }

    // 현재 위치 요청 실패 처리
    function handleError(error) {
        alert("현재 위치를 가져올 수 없습니다. 위치 서비스 사용을 허용해주세요.");
        console.error("Geolocation Error: ", error);
    }

    // 주소인지 판단
    function isAddress(keyword) {
        return /\d/.test(keyword) && /\s/.test(keyword); // 숫자와 공백 포함 여부 확인
    }

    // 장소 검색
    function searchPlaces() {
        const keyword = $('#search-place').val().trim();

        if (!keyword) {
            alert('검색어를 입력하세요.');
            return;
        }

        if (isAddress(keyword)) {
            searchAddress(keyword); // 주소 검색
        } else {
            $.ajax({
                url: `https://dapi.kakao.com/v2/local/search/keyword.json`,
                type: 'GET',
                headers: {Authorization: `KakaoAK ${apiKey}`},
                data: {
                    query: keyword,
                    x: map.getCenter().getLng(),
                    y: map.getCenter().getLat(),
                    radius: 5000,
                    size: 15
                },
                success: handleSearchSuccess,
                error: handleSearchError
            });
        }
    }

    // 주소 검색
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

    // 검색 성공 처리
    function handleSearchSuccess(response) {
        if (response.documents.length === 0) {
            $('.search-result-info').html('<p class="no-result">검색 결과가 없습니다.</p>');
            $('.search-result').html('');
        } else {
            displayPlaces(response.documents);
        }
    }

    // 검색 실패 처리
    function handleSearchError(error) {
        console.error("Search Error: ", error);
        alert('장소 검색에 실패했습니다.');
    }

    // 검색된 장소 표시
    function displayPlaces(places) {
        let listHtml = '';
        const bounds = new kakao.maps.LatLngBounds();

        $('.search-result-info').html(`<p>검색 결과 총 ${places.length}건</p>`);

        clearMarkers();

        places.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y, place.x);

            createMarker(position, index);

            const rating = (Math.random() * 4 + 1).toFixed(1);

            listHtml += createListItem(place, index, rating);

            bounds.extend(position);
        });

        $('.search-result').html(listHtml);
        map.setBounds(bounds);

        bindListClickEvent();
    }

    // 마커 초기화
    function clearMarkers() {
        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }

    // 마커 생성
    function createMarker(position, index) {
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
            yAnchor: 1
        });

        markers.push(marker);

        $(document).on('click', `.marker[data-index="${index}"]`, function () {
            map.setCenter(position);
            map.setLevel(2);
        });
    }

// 리스트 항목 생성
    function createListItem(place, index, rating) {
        const markerLabel = String.fromCharCode(65 + index);

        // 주소 검색인 경우 데이터 처리
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

        // 카테고리 이름 처리
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

    // 리스트 클릭 이벤트 바인딩
    function bindListClickEvent() {
        $('.search-result-item').on('click', function () {
            const markerIndex = $(this).data('marker-index');
            const marker = markers[markerIndex];
            const position = marker.getPosition();

            map.setCenter(position);
            map.setLevel(1);
        });
    }

    // 지도 확대/축소
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

    // 이벤트 바인딩
    function bindEvents() {
        $('.map-tool-btn.location').on('click', initializeMapWithCurrentLocation);
        $('#search-place').on('keypress', function (e) {
            if (e.key === 'Enter') {
                searchPlaces();
            }
        });
        $('.search-group .btn').on('click', searchPlaces);
    }

    // 초기화
    initializeMapWithCurrentLocation();
    bindZoomControlEvents();
    bindEvents();
});
