$(document).ready(function () {
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
            $(".map-wrap.div4, .map-wrap.two, .map-wrap.ol, .map-wrap.xd").hide();
        } else if ($(this).is("#div4Btn")) {
            $("#container").attr("class", "mapdiv4");
            $(".map-wrap.div2, .map-wrap.div4").show();
            $(".map-wrap.two, .map-wrap.ol, .map-wrap.xd").hide();
        } else if ($(this).is("#divResetBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.two, .map-wrap.div2, .map-wrap.div4, .map-wrap.ol, .map-wrap.xd").hide();
            $(".map-wrap.reset").show();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
        } else if ($(this).is("#div2DBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.two").show();
            $(".map-wrap.div2, .map-wrap.div4, .map-wrap.reset, .map-wrap.ol, .map-wrap.xd").hide();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
        } else if ($(this).is("#divOlBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.ol").show();
            $(".map-wrap.div2, .map-wrap.div4, .map-wrap.reset, .map-wrap.two, .map-wrap.xd").hide();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
            $('.kakao-map .category').removeClass('active');
        } else if ($(this).is("#divXdBtn")) {
            $("#container").removeAttr("class");
            $(".map-wrap.xd").show();
            $(".map-wrap.div2, .map-wrap.div4, .map-wrap.reset, .map-wrap.two, .map-wrap.ol").hide();
            $(".map-menu .menu-cont").addClass("opened").removeClass("closed");
            $(".map-menu .menu-cont-btn").addClass("on");
            $('.kakao-map .category').removeClass('active');
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