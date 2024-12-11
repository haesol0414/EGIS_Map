import {generateStars} from './utils/rating.js';

$(document).ready(function () {
    const apiKey = "4222cd468120fdc1a67d92b7f3190ce3";
    let map;

    // 지도 초기화
    const mapContainer = $('#map')[0];

    // 현재 위치로 지도 초기화 및 마커 추가
    function initializeMapWithCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const userPosition = new kakao.maps.LatLng(lat, lng);

                // 지도 초기화
                if (!map) {
                    map = new kakao.maps.Map(mapContainer, {
                        center: userPosition,
                        level: 3
                    });
                } else {
                    map.setCenter(userPosition);
                }

                console.log(`지도 초기화 또는 이동: 위도 ${lat}, 경도 ${lng}`);
            }, function (error) {
                alert("현재 위치를 가져올 수 없습니다. 위치 서비스 사용을 허용해주세요.");
                console.error("Geolocation Error: ", error);
            });
        } else {
            alert("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    }

    // 초기화: 페이지 로드 시 현재 위치로 지도 설정
    initializeMapWithCurrentLocation();

    // 현재 위치 버튼 클릭 이벤트
    $('.map-tool-btn.location').on('click', function () {
        initializeMapWithCurrentLocation();
    });

    // 장소 검색
    $('#search-place').on('keypress', function (e) {
        if (e.key === 'Enter') {
            searchPlaces();
        }
    });

    $('.search-group .btn').on('click', function () {
        searchPlaces();
    });

    function searchPlaces() {
        const keyword = $('#search-place').val();

        if (!keyword.trim()) {
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
                radius: 10000, // 반경 10km
                size: 15
            },
            success: function (response) {
                if (response.documents.length === 0) {
                    $('.search-result').html('<li class="no-result">검색 결과가 없습니다.</li>');
                } else {
                    displayPlaces(response.documents);
                }
            },
            error: function (error) {
                console.error(error);
                alert('장소 검색에 실패했습니다.');
            }
        });
    }

    function displayPlaces(places) {
        let listHtml = '';
        const bounds = new kakao.maps.LatLngBounds();
        const markers = [];

        places.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y, place.x);
            const markerLabel = String.fromCharCode(65 + index);

            // 마커 HTML 콘텐츠 생성
            const markerContent = `
            <div class="marker" 
                style="width:30px; height:40px; 
                background:url('https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png') no-repeat; 
                background-size:cover; cursor: pointer;"
                data-index="${index}">
            </div>
        `;

            // 커스텀 오버레이로 마커 생성
            const marker = new kakao.maps.CustomOverlay({
                map: map,
                position: position,
                content: markerContent,
                yAnchor: 1
            });
            markers.push(marker); // 마커 배열에 추가

            // **마커 클릭 이벤트 등록**
            $(document).on('click', `.marker[data-index="${index}"]`, function () {
                map.setCenter(position); // 해당 마커 위치로 지도 중심 이동
                map.setLevel(2); // 확대 레벨 설정
            });

            // 랜덤 별점 생성 (1~5 범위의 소수점 한자리)
            const rating = (Math.random() * 4 + 1).toFixed(1);

            // 리스트 항목 생성
            listHtml += `
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

            // 지도 영역 확장
            bounds.extend(position);
        });

        // 검색 결과 리스트 업데이트
        $('.search-result').html(listHtml);

        // 제목 클릭 시 마커 위치로 지도 이동 및 확대
        $('.search-result-item').on('click', function () {
            const markerIndex = $(this).data('marker-index');
            const marker = markers[markerIndex];
            const position = marker.getPosition();

            // 지도 중심 이동 및 확대
            map.setCenter(position);
            map.setLevel(1); // 확대 레벨 설정
        });

        // 지도 영역 설정
        map.setBounds(bounds);
    }
});
