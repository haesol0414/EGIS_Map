import KakaoAPI from '../api/kakaoApi.js';
import {daeguSubwayGeoJSON} from "../data/geoJSON.js";

// 카테고리별 마커 레이어 생성
export async function addCategoryLayer(currentPosition, categoryCode) {
    try {
        const res = await KakaoAPI.searchCategory(categoryCode, currentPosition);
        const places = res.documents;

        const markers = places.map(p => {
            const position = ol.proj.fromLonLat([parseFloat(p.x), parseFloat(p.y)]);

            // 마커 객체 생성
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(position),
                name: p.place_name || '건물명 없음',
                category: p.category_name || '',
                roadAddress: p.road_address_name || '도로명 주소 없음',
                address: p.address_name || '지번 주소 없음',
                phone: p.phone || '전화번호 없음',
                placeUrl: p.place_url
            });

            // 마커 스타일
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({ color: '#003472' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                }),
                text: new ol.style.Text({
                    text: p.place_name,
                    font: 'bold 12px Arial',
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 3 }),
                    offsetY: -16
                })
            }));

            return marker;
        });

        // 마커 레이어 생성
        const markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: markers
            }),
            visible: false
        });

        return markerLayer; // Promise resolve
    } catch (err) {
        console.error(`API 호출 중 오류 발생 (${categoryCode}):`, err);
        throw err; // Promise reject
    }
}

// 지도 중심 변경에 따른 카테고리 마커 레이어 갱신
export async function updateCategoryLayers(map, layers, categoryCode) {
    try {
        const center = ol.proj.toLonLat(map.getView().getCenter());
        const currentPosition = { lng: center[0], lat: center[1] };

        // 새로운 레이어 생성
        const updatedLayer = await addCategoryLayer(currentPosition, categoryCode);

        // 기존 레이어 제거 후 새로운 레이어 추가
        if (layers[categoryCode]) {
            map.removeLayer(layers[categoryCode]);
        }

        layers[categoryCode] = updatedLayer;
        map.addLayer(updatedLayer);
        updatedLayer.setVisible(true);
    } catch (err) {
        console.error("레이어 갱신 중 오류:", err);
    }
}

// 지하철 라인 추가
export function addSubwayLinesLayers(map) {
    const vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(daeguSubwayGeoJSON, {
            featureProjection: 'EPSG:3857' // 지도 좌표계에 맞게 변환
        })
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: (feature) => {
            const line = feature.get('line');
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: line === "1호선" ? 'red' : 'blue',
                    width: 3
                }),
                text: new ol.style.Text({
                    text: line,
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                    offsetY: -10
                })
            });
        }
    });

    map.addLayer(vectorLayer);
}

