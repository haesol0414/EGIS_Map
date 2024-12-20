import KakaoAPI from '../api/kakaoApi.js';

// 카테고리별 마커 레이어 생성
export function createCategoryLayer(userPosition, categoryCode, callback) {
    KakaoAPI.searchCategory(
        categoryCode,
        userPosition,
        (data) => {
            const items = data.documents;

            const markers = items.map(item => {
                const position = ol.proj.fromLonLat([parseFloat(item.x), parseFloat(item.y)]);

                // 마커 객체 생성
                const marker = new ol.Feature({
                    geometry: new ol.geom.Point(position),
                    name: item.place_name || '건물명 없음',
                    category: item.category_name || '',
                    roadAddress: item.road_address_name || '도로명 주소 없음',
                    address: item.address_name || '지번 주소 없음',
                    phone: item.phone || '전화번호 없음',
                    placeUrl: item.place_url
                });

                // 마커 스타일
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        fill: new ol.style.Fill({ color: '#003472' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                    }),
                    text: new ol.style.Text({
                        text: item.place_name,
                        font: 'bold 12px Arial',
                        fill: new ol.style.Fill({ color: 'black' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 3 }),
                        offsetY: -16
                    })
                }));

                return marker;
            });

            // 마커 레이어 생성
            const layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: markers
                }),
                visible: false
            });

            callback(layer);
        },
        (err) => {
            console.error(`API 호출 중 오류 발생 (${categoryCode}):`, err);
        }
    );
}

// 지도 중심 변경에 따른 카테고리 레이어 갱신
export function updateCategoryLayers(map, layers, categoryCode) {
    const center = ol.proj.toLonLat(map.getView().getCenter());
    const userPosition = { lng: center[0], lat: center[1] };

    createCategoryLayer(userPosition, categoryCode, (newLayer) => {
        if (layers[categoryCode]) {
            map.removeLayer(layers[categoryCode]);
        }

        layers[categoryCode] = newLayer;

        map.addLayer(newLayer);
        newLayer.setVisible(true);
    });
}

// 라인 레이어 생성

