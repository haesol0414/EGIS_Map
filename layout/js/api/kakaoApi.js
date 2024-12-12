const KakaoAPI = {
    apiKey: "4222cd468120fdc1a67d92b7f3190ce3",

    // 공통 요청 메서드
    request: function (url, params, successCallback, errorCallback) {
        $.ajax({
            url: url,
            type: 'GET',
            headers: { Authorization: `KakaoAK ${this.apiKey}` },
            data: params,
            success: successCallback,
            error: errorCallback
        });
    },

    // 키워드 검색 요청
    searchKeyword: function (keyword, position, successCallback, errorCallback) {
        const params = {
            query: keyword,
            x: position.lng,
            y: position.lat,
            radius: 3000,
            size: 15,
            sort: "distance"
        };
        this.request(
            `https://dapi.kakao.com/v2/local/search/keyword.json`,
            params,
            successCallback,
            errorCallback
        );
    },

    // 카테고리 검색 요청
    searchCategory: function (categoryCode, position, successCallback, errorCallback) {
        const params = {
            category_group_code: categoryCode,
            x: position.lng,
            y: position.lat,
            radius: 3000,
            size: 15,
            sort: "distance"
        };
        this.request(
            `https://dapi.kakao.com/v2/local/search/category.json`,
            params,
            successCallback,
            errorCallback
        );
    },

    // 주소 검색 요청
    searchAddress: function (query, successCallback, errorCallback) {
        const params = {
            query: query,
            size: 15
        };
        this.request(
            `https://dapi.kakao.com/v2/local/search/address.json`,
            params,
            successCallback,
            errorCallback
        );
    }
};

export default KakaoAPI;
