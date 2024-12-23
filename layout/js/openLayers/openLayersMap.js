import {createCategoryLayer, updateCategoryLayers, createSubwayLineLayer, createPolygonLayer} from './layers.js';
import { getUserPosition } from '../utils/utils.js';
import { createOlInfoHTML } from '../utils/htmlTemplates.js';

let map = null;
let line1Layer = null;
let line2Layer = null;

// 지도 초기화
const initializeMap = async () => {
    getUserPosition(
        async (userPosition) => {
            map = new ol.Map({
                target: 'ol-map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: `https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`,
                            attributions: 'Map data © Google',
                        }),
                    }),
                ],
                view: new ol.View({
                    center: ol.proj.fromLonLat([128.6, 35.87]),
                    zoom: 17,
                }),
            });

            // 현재 위치 버튼 설정
            setupCurrentLocationButton();

            // 카테고리 토글
            await handleCategoryToggle(userPosition);

            // 지하철 라인 토글
            setupSubwayLineToggle();

            // 폴리곤 토글
            setupPolygonToggle();

            // 클릭된 feature의 속성 얻기
            map.on('singleclick', handleMapClick);
        },
        () => {
            alert('위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
        }
    );
};

// 카테고리 토글 처리
const handleCategoryToggle = async (userPosition) => {
    const categoryButtons = document.querySelectorAll('.ol-map .category');
    const layers = {};

    for (const categoryButton of categoryButtons) {
        const categoryCode = categoryButton.getAttribute('data-category');

        // 초기 마커 레이어 생성
        const layer = await createCategoryLayer(userPosition, categoryCode);
        layers[categoryCode] = layer;
        map.addLayer(layer);

        // 버튼 클릭 이벤트 처리
        categoryButton.addEventListener('click', async () => {
            const isActive = categoryButton.classList.contains('active');

            if (isActive) {
                categoryButton.classList.remove('active');
                layers[categoryCode].setVisible(false);
            } else {
                categoryButtons.forEach((btn) => btn.classList.remove('active'));
                Object.values(layers).forEach((layer) => layer.setVisible(false));

                categoryButton.classList.add('active');

                const center = ol.proj.toLonLat(map.getView().getCenter());
                const updatedPosition = { lng: center[0], lat: center[1] };

                const updatedLayer = await createCategoryLayer(updatedPosition, categoryCode);
                map.removeLayer(layers[categoryCode]);
                layers[categoryCode] = updatedLayer;

                map.addLayer(updatedLayer);
                updatedLayer.setVisible(true);
                map.render();
            }
        });
    }

    map.on('moveend', async () => {
        const activeButton = document.querySelector('.category.active');
        if (activeButton) {
            const activeCategoryCode = activeButton.getAttribute('data-category');
            await updateCategoryLayers(map, layers, activeCategoryCode);
        }
    });
};

// 현재 위치로 이동 버튼 설정
const setupCurrentLocationButton = () => {
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
};

// 지하철 라인 토글
const setupSubwayLineToggle = () => {
    const line1Toggle = document.getElementById('ol-line1');
    const line2Toggle = document.getElementById('ol-line2');

    // 1호선 버튼 클릭 이벤트
    line1Toggle.addEventListener('click', () => {
        if (!line1Layer) {
            // 1호선 레이어 생성
            line1Layer = createSubwayLineLayer('1호선', 'red');
            map.addLayer(line1Layer);
        }
        const isVisible = line1Layer.getVisible();
        line1Layer.setVisible(!isVisible);
        line1Toggle.classList.toggle('active', !isVisible);
    });

    // 2호선 버튼 클릭 이벤트
    line2Toggle.addEventListener('click', () => {
        if (!line2Layer) {
            // 2호선 레이어 생성
            line2Layer = createSubwayLineLayer('2호선', 'green');
            map.addLayer(line2Layer);
        }
        const isVisible = line2Layer.getVisible();
        line2Layer.setVisible(!isVisible);
        line2Toggle.classList.toggle('active', !isVisible);
    });
};

// 폴리곤 토글
const setupPolygonToggle = () => {
    const polygonToggleBtn = document.querySelector('.ol-polygon-btn'); // 버튼 선택
    let polygonLayer = null; // 폴리곤 레이어 초기화

    polygonToggleBtn.addEventListener('click', () => {
        if (!polygonLayer) {
            // 폴리곤 레이어 생성
            polygonLayer = createPolygonLayer();

            map.addLayer(polygonLayer);
        }
        const isVisible = polygonLayer.getVisible();
        polygonLayer.setVisible(!isVisible); // 폴리곤 레이어 보이기/숨기기

        polygonToggleBtn.classList.toggle('active', !isVisible); // 버튼 상태 업데이트
    });
};


// 마커 클릭 이벤트
const handleMapClick = (e) => {
    const feature = map.forEachFeatureAtPixel(e.pixel, (feat) => {
        // Point 타입인지 확인 (마커만 처리)
        return feat.getGeometry().getType() === 'Point' ? feat : null;
    });

    if (feature && feature.values_) {
        // feature.values_ 활용
        const infoHTML = createOlInfoHTML(feature.values_); // values_로 정보 생성
        const infoContainer = document.getElementById('ol-info-container');
        infoContainer.innerHTML = infoHTML;
    }
};

// 지도 초기화
initializeMap().catch((error) => {
    console.error('Error during map initialization:', error);
});
