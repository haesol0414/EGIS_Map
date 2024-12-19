import KakaoAPI from './api/KakaoAPI.js';
import { createOlInfoHTML } from './utils/kakaoUi.js';

// 현재 위치로 지도 초기화
function initializeMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const userPosition = { lng: coords.longitude, lat: coords.latitude };

                // 지도 초기화
                const map = new ol.Map({
                    target: 'ol-map',
                    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
                    view: new ol.View({
                        center: ol.proj.fromLonLat([userPosition.lng, userPosition.lat]),
                        zoom: 17
                    })
                });

                // 현재 위치 버튼 설정
                setupCurrentLocationButton(map);
                // 카테고리 토글 설정
                handleCategoryToggle(map, userPosition);

                // 클릭된 feature의 속성 얻기
                map.on('singleclick', (e) => {
                    const feature = map.forEachFeatureAtPixel(e.pixel, feat => feat);

                    if (feature) {
                        const infoHTML = createOlInfoHTML(feature.values_);

                        const infoContainer = document.getElementById('ol-info-container');
                        infoContainer.innerHTML = infoHTML;
                    }
                });
            },
            () => {
                alert('현재 위치를 가져올 수 없어 기본 위치를 사용합니다.');
            }
        );
    } else {
        alert('Geolocation을 지원하지 않습니다.');
    }
}

// 카테고리별 마커 레이어 생성
function createCategoryLayer(userPosition, categoryCode, callback) {
    KakaoAPI.searchCategory(
        categoryCode,
        userPosition,
        (data) => {
            const items = data.documents;

            const markers = items.map(item => {
                const position = ol.proj.fromLonLat([parseFloat(item.x), parseFloat(item.y)]);

                // 피처 객체 생성
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

// 지도 중심 변경에 따른 카테고리 재검색
function updateCategoryLayers(map, layers, categoryCode) {
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

// 카테고리 버튼 토글 처리
function handleCategoryToggle(map, userPosition) {
    const categoryButtons = document.querySelectorAll('.ol-map .category');
    const layers = {};

    categoryButtons.forEach(categoryButton => {
        const categoryCode = categoryButton.getAttribute('data-category');

        createCategoryLayer(userPosition, categoryCode, (layer) => {
            layers[categoryCode] = layer;
            map.addLayer(layer);
        });

        categoryButton.addEventListener('click', () => {
            const isActive = categoryButton.classList.contains('active');

            if (isActive) {
                categoryButton.classList.remove('active');
                layers[categoryCode].setVisible(false);
            } else {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                Object.values(layers).forEach(layer => layer.setVisible(false));

                categoryButton.classList.add('active');
                layers[categoryCode].setVisible(true);

                const center = ol.proj.toLonLat(map.getView().getCenter());
                const updatedPosition = { lng: center[0], lat: center[1] };

                createCategoryLayer(updatedPosition, categoryCode, (updatedLayer) => {
                    map.removeLayer(layers[categoryCode]);

                    layers[categoryCode] = updatedLayer;
                    map.addLayer(updatedLayer);
                    updatedLayer.setVisible(true);

                    map.render();
                });
            }
            map.render();
        });
    });

    map.on('moveend', () => {
        const activeButton = document.querySelector('.category.active');
        if (activeButton) {
            const activeCategoryCode = activeButton.getAttribute('data-category');
            updateCategoryLayers(map, layers, activeCategoryCode);
        }
    });
}

// 현재 위치로 이동 버튼 이벤트 설정
function setupCurrentLocationButton(map) {
    const currentBtn = document.getElementById('current-location');

    currentBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const userPosition = { lng: coords.longitude, lat: coords.latitude };
                    const view = map.getView();
                    view.setCenter(ol.proj.fromLonLat([userPosition.lng, userPosition.lat]));
                    view.setZoom(17);
                },
                () => {
                    alert('현재 위치를 가져올 수 없습니다.');
                }
            );
        } else {
            alert('Geolocation을 지원하지 않습니다.');
        }
    });
}

// 현재 위치로 지도 초기화 및 설정 실행
initializeMap();
