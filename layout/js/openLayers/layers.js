import KakaoAPI from '../api/kakaoApi.js';
import {daeguSubwayGeoJSON} from "../data/geoJSON.js";

// 카테고리별 마커 색상 정의
const categoryColors = {
    "FD6": "#FF5733",
    "CE7": "#33FF57",
    "CS2": "#3357FF",
    "BK9": "#FFC300",
    "SW8": "#C700FF"
};

// 마커 레이어 추가
export const createCategoryLayer = async (currentPosition, categoryCode) => {
    try {
        const res = await KakaoAPI.searchCategory(categoryCode, currentPosition);
        const places = res.documents;

        const markers = places.map((p) => {
            const position = ol.proj.fromLonLat([parseFloat(p.x), parseFloat(p.y)]);
            const color = categoryColors[categoryCode] || '#003472'; // 기본 색상

            // 마커 객체 생성
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(position),
                name: p.place_name || '건물명 없음',
                category: p.category_name || '',
                roadAddress: p.road_address_name || '도로명 주소 없음',
                address: p.address_name || '지번 주소 없음',
                phone: p.phone || '전화번호 없음',
                placeUrl: p.place_url,
            });

            // 마커 스타일
            marker.setStyle(
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        fill: new ol.style.Fill({ color: color }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                    }),
                    text: new ol.style.Text({
                        text: p.place_name,
                        font: 'bold 12px Arial',
                        fill: new ol.style.Fill({ color: 'black' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 3 }),
                        offsetY: -16,
                    }),
                })
            );

            return marker;
        });

        // 마커 레이어 생성
        const markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: markers,
            }),
            visible: false,
        });

        return markerLayer;
    } catch (err) {
        console.error(`API 호출 중 오류 발생 (${categoryCode}):`, err);
        throw err;
    }
};


// 지도 중심 변경에 따른 카테고리 마커 레이어 갱신
export const updateCategoryLayers = async (map, layers, categoryCode) => {
    try {
        const center = ol.proj.toLonLat(map.getView().getCenter());
        const currentPosition = { lng: center[0], lat: center[1] };

        // 새로운 레이어 생성
        const updatedLayer = await createCategoryLayer(currentPosition, categoryCode);

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
};

// 라인 레이어 생성 함수
export const createSubwayLineLayer = (lineName, color) => {
    const vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(daeguSubwayGeoJSON, {
            featureProjection: 'EPSG:3857', // 지도 좌표계에 맞게 변환
        }),
    });

    return new ol.layer.Vector({
        source: vectorSource,
        style: (feature) => {
            if (feature.get('line') === lineName) {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: 3,
                    }),
                    text: new ol.style.Text({
                        text: lineName,
                        font: 'bold 14px Arial',
                        fill: new ol.style.Fill({ color: 'black' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                        offsetY: -10,
                    }),
                });
            }
        },
        visible: false,
    });
};

// 폴리곤 레이어 생성
export const createPolygonLayer = () => {
    const feature = new ol.Feature({
        geometry: new ol.geom.Polygon(
            [
                [
                    [128.5958, 35.8695],     // 북서쪽 모서리
                    [128.5970, 35.8695],     // 북동쪽 모서리
                    [128.5970, 35.8685],     // 남동쪽 모서리
                    [128.5958, 35.8685],     // 남서쪽 모서리
                ]
            ]
        ),
    });

    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const polygonLayer = new ol.layer.Vector({
        source : vectorSource,
        style : [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0,0,255,0.1)'
                })
            })
        ],
        visible: false, 
    });

    return polygonLayer;
}