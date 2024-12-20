import { createCategoryLayer, updateCategoryLayers } from './layers.js';
import { getUserPosition } from '../utils/utils.js';
import { createOlInfoHTML } from '../utils/htmlTemplates.js'


// 지도 초기화
function initializeMap() {
    getUserPosition(
        (userPosition) => {
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
            alert('위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
        }
    );
}

// 카테고리 토글 처리
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
        getUserPosition(
            (userPosition) => {
                const view = map.getView();
                view.setCenter(ol.proj.fromLonLat([userPosition.lng, userPosition.lat]));
                view.setZoom(17);
            },
            () => {
                alert('현재 위치를 가져올 수 없습니다.');
            }
        );
    });
}

// 현재 위치로 지도 초기화 및 설정 실행
initializeMap();
