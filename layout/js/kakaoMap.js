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

                console.log(`지도 초기화 또는 이동: 위도 ${lat}, 경도 ${lng}`);
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

    // 장소 검색
    function searchPlaces() {
        const keyword = $('#search-place').val().trim();

        if (!keyword) {
            alert('검색어를 입력하세요.');
            return;
        }

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

    // 검색 성공 처리
    function handleSearchSuccess(response) {
        if (response.documents.length === 0) {
            $('.search-result-info').html('<p>검색 결과가 없습니다.</p>');
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

        // 검색 결과 개수 표시
        const totalResults = places.length;
        $('.search-result-info').html(`<p>검색 결과 총 ${totalResults}건</p>`);

        // 기존 마커 초기화
        clearMarkers();

        places.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y, place.x);

            // 마커 생성 및 등록
            createMarker(position, index);

            // 랜덤 별점 생성
            const rating = (Math.random() * 4 + 1).toFixed(1);

            // 리스트 항목 생성
            listHtml += createListItem(place, index, rating);

            // 지도 영역 확장
            bounds.extend(position);
        });

        // 검색 결과 리스트 업데이트
        $('.search-result').html(listHtml);

        // 지도 영역 설정
        map.setBounds(bounds);

        // 리스트 클릭 이벤트 바인딩
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

        // 마커 클릭 이벤트 등록
        $(document).on('click', `.marker[data-index="${index}"]`, function () {
            map.setCenter(position);
            map.setLevel(2); // 확대 레벨
        });
    }

    // 리스트 항목 생성
    function createListItem(place, index, rating) {
        const markerLabel = String.fromCharCode(65 + index);

        return `
        <li class="search-result-item" data-marker-index="${index}">
            <div class="place-name">
                <span class="place-idx">${markerLabel}.</span>
                <span class="place-link">${place.place_name}</span>
            </div>
            <div class="place-rating">
                ${generateStars(rating)}
                <span class="rating-value">${rating}</span>
            </div>
            <p class="road-address-name">${place.road_address_name || '도로명 주소 없음'}</p>
            <p class="address-name">
                <span class="sticker">지번</span>
                ${place.address_name}</p>
            <p class="tel">${place.phone || '전화번호 없음'}</p>
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
            map.setLevel(1); // 확대 레벨
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

    // 지도 확대 축소
    function bindZoomControlEvents() {
        // zoomSlider.on('input', function () {
        //     const zoomLevel = parseInt($(this).val());
        //     map.setLevel(zoomLevel);
        // });

        $('.range-btn.zoomin').on('click', function () {
            let currentLevel = map.getLevel();
            if (currentLevel > 1) {
                map.setLevel(currentLevel - 1); // 레벨이 작을수록 확대
                zoomSlider.val(map.getLevel());
            }
        });

        $('.range-btn.zoomout').on('click', function () {
            let currentLevel = map.getLevel();
            if (currentLevel < 10) { // 최대 레벨 10으로 설정
                map.setLevel(currentLevel + 1); // 레벨이 클수록 축소
                zoomSlider.val(map.getLevel());
            }
        });
    }


    // 초기화
    initializeMapWithCurrentLocation();
    bindZoomControlEvents();
    bindEvents();
});
