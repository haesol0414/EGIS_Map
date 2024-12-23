const KakaoAPI = {
    apiKey: "4222cd468120fdc1a67d92b7f3190ce3",

    // 공통 요청 메서드
    request: function (url, params) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                headers: { Authorization: `KakaoAK ${this.apiKey}` },
                data: params,
                success: resolve,
                error: reject
            });
        });
    },

    // 키워드 검색 요청
    searchKeyword: async function (keyword, position) {
        const params = {
            query: keyword,
            x: position.lng,
            y: position.lat,
            radius: 3000,
            size: 15,
            sort: "distance"
        };
        return this.request(
            `https://dapi.kakao.com/v2/local/search/keyword.json`,
            params
        );
    },

    // 카테고리 검색 요청
    searchCategory: async function (categoryCode, position) {
        const params = {
            category_group_code: categoryCode,
            x: position.lng,
            y: position.lat,
            radius: 3000,
            size: 15,
            sort: "distance"
        };
        return this.request(
            `https://dapi.kakao.com/v2/local/search/category.json`,
            params
        );
    },

    // 주소 검색 요청
    searchAddress: async function (query) {
        const params = {
            query: query,
            size: 15
        };
        return this.request(
            `https://dapi.kakao.com/v2/local/search/address.json`,
            params
        );
    }
};

export default KakaoAPI;
