$(document).ready(function () {
    const apiKey = "4222cd468120fdc1a67d92b7f3190ce3";
    let map, currentPosition;

    // 지도 초기화
    const mapContainer = $('#map')[0];
    const mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3
    };
    map = new kakao.maps.Map(mapContainer, mapOption);

    // 현재 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentPosition = new kakao.maps.LatLng(lat, lng);

            // 지도 중심을 현재 위치로 이동
            map.setCenter(currentPosition);
        });
    } else {
        alert("현재 위치를 가져올 수 없습니다.");
        return;
    }

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
                x: currentPosition.getLng(),
                y: currentPosition.getLat(),
                radius: 5000, // 반경 5km
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

            // 마커 생성 및 지도에 추가
            const marker = new kakao.maps.Marker({
                map: map,
                position: position
            });
            markers.push(marker); // 마커 배열에 추가

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

    function generateStars(rating) {
        const fullStars = Math.floor(rating); // 정수 별 개수
        const halfStar = rating % 1 >= 0.5 ? 1 : 0; // 반별 여부
        const emptyStars = 5 - fullStars - halfStar; // 빈 별 개수

        let starsHtml = '';

        // 정수 별
        for (let i = 0; i < fullStars; i++) {
            starsHtml += `<span class="star full"></span>`;
        }

        // 반별
        if (halfStar) {
            starsHtml += `<span class="star half"></span>`;
        }

        // 빈 별
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += `<span class="star empty"></span>`;
        }

        return starsHtml;
    }

    /* ========== 로그인 임시 스크립트 ========== */
    $(".login").addClass("active");

    $(".login .submit-btn").on("click", function () {
        $(this).closest(".popup-panel").hide();
        $(".login").removeClass("active");
        $(".logout").addClass("active");
    });

    $(".logout-btn").on("click", function () {
        $(this).closest(".logout").removeClass("active");
        $(".login").addClass("active");
    });
    /* ========== 로그인 임시 스크립트 ========== */

    /* ========== switch button 임시 스크립트 ========== */
    $(".switch-btn input[type='checkbox']").on("click", function () {
        if ($(this).is(":checked")) {
            $(this).closest(".map-wrap").find("canvas").css("background", "black");
        } else {
            $(this).closest(".map-wrap").find("canvas").css("background", "#f2f0e8");
        }
    });
    /* ========== switch button 임시 스크립트 ========== */


    /* datepicker */
    $.datepicker.setDefaults({
        dateFormat: 'yy년 mm월 dd일',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });

    $(".datepicker").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showOn: "both",
        buttonText: "날짜 선택"
    });

    $(".datepicker:disabled").datepicker('option', 'disabled', true);

    /* range */
    $(".map-range").each(function () {
        var rangeValue = $(this).children(".range-bar");

        var slider = rangeValue.slider({
            range: "max",
            min: 1,
            max: 10,
            value: 8,
            orientation: "vertical"
        });

        $(this).find(".range-btn.zoomin").click(function () {
            var sliderValue = rangeValue.slider("option", "value");
            slider.slider("value", sliderValue + 1);
        });

        $(this).find(".range-btn.zoomout").click(function () {
            var sliderValue = rangeValue.slider("option", "value");
            slider.slider("value", sliderValue - 1);
        });
    });

    /* file */
    $("#file").on('change', function () {
        var fileName = $("#file").val();
        var fileNameNow = $(".upload-name").html();
        $(".upload-name").html(fileName);
        $(".upload-name + .delete-btn").show();
        if (fileName == "") {
            $(".upload-name").html("첨부파일");
            $(".upload-name + .delete-btn").hide();
            if ($(".upload-name").not().html("첨부파일")) {
                $(".upload-name").html(fileNameNow);
                $(".upload-name + .delete-btn").show();
            }
        }
    });

    $(".upload-name + .delete-btn").on("click", function () {
        $(this).prev(".upload-name").html("첨부파일");
        $(this).hide();
    });

    /* division */
    $(".tool-btn *[name='divBtn']").on("click", function () {
        if ($(this).is("#div2Btn")) {
            $("#container").attr("class", "mapdiv2");
            $(".map-wrap.div2").show();
            $(".map-wrap.div4, .map-wrap.two").hide();
        } else if ($(this).is("#div4Btn")) {
            $("#container").attr("class", "mapdiv4");
            $(".map-wrap.div2, .map-wrap.div4").show();
            $(".map-wrap.two").hide();
        } else if ($(this).is("#divResetBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.two, .map-wrap.div2, .map-wrap.div4").hide();
            $(".map-wrap.reset").show();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
        } else if ($(this).is("#div2DBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.two").show(); // 2D 지도만 표시
            $(".map-wrap.div2, .map-wrap.div4, .map-wrap.reset").hide();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
        }

        if ($(this).is("#div2Btn") || $(this).is("#div4Btn")) {
            $(".map-menu .menu-cont").addClass("closed").removeClass("opened");
            $(".map-menu .menu-cont-btn").removeClass("on");
        }
    });

    $(".menu-cont-btn").on("click", function () {
        $(this).toggleClass("on");
        if ($(this).hasClass("on")) {
            $(this).closest(".map-menu").find(".menu-cont").addClass("opened").removeClass("closed");
        } else {
            $(this).closest(".map-menu").find(".menu-cont").addClass("closed").removeClass("opened");
        }
    });

    /* menu button */
    $(".bar-btn").each(function (index, btn) {

        if ($(btn).parent("li").is(":first-child")) {
            $(this).parent().addClass("active");
            $("." + $(this).attr("data-tab")).addClass("active");
            $(this).closest(".map-menu").find(".menu-cont").addClass("opened");
            $(this).closest(".map-menu").find(".menu-cont-btn").addClass("on");
        }

        $(this).on("click", function () {

            var barData = $(this).attr("data-tab");
            var barCont = $(this).closest(".map-menu").find("." + barData);

            $(this).parent().addClass("active").siblings().removeClass("active");
            $(barCont).addClass("active").siblings().removeClass("active");

            if ($(this).closest(".map-menu").find(".menu-cont").hasClass("closed")) {
                $(this).closest(".map-menu").find(".menu-cont").removeClass("closed").addClass("opened");
                $(this).closest(".map-menu").find(".menu-cont-btn").addClass("on");
            }
        });

    });

    $(".bar-cont").mCustomScrollbar({
        scrollbarPosition: "outside"
    });

    $(".mCustomScrollbar-y").mCustomScrollbar({
        scrollbarPosition: "outside"
    });

    /* map tool */
    $(".map-tool-btn").not(".initial").on("click", function () {
        $(this).toggleClass("active").siblings().removeClass("active");
    });

    /* popup */
    $("*[data-popup]").on("click", function () {
        $("." + ($(this).attr("data-popup"))).show();
    });

    $(".popup-panel .popup-close").on("click", function () {
        $(this).closest(".popup-panel").hide();
    });
});