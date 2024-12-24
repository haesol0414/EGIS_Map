import {createCategoryLayer, updateCategoryLayers, createSubwayLineLayer, createPolygonLayer} from './layers.js';
import {getUserPosition} from '../utils/utils.js';
import {createOlInfoHTML} from '../utils/htmlTemplates.js';

let map = null;

// 지도 초기화
const initializeMap = async () => {
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

    // 카테고리 토글
    handleCategoryToggle();
    // 현재 위치 버튼 설정
    handleCurrentLocationBtn();
    // 지하철 라인 토글
    handleSubwayLineToggle();
    // 폴리곤 토글
    handlePolygonToggle();

    // 클릭된 마커 속성 얻기
    map.on('singleclick', handleMarkerClick);
}


// 카테고리 토글 처리
const handleCategoryToggle = () => {
    const categoryButtons = document.querySelectorAll('.ol-map .category');
    const layers = {};  // 각 카테고리의 레이어를 저장할 객체
    // 지도 중심 좌표 가져오기
    const getCenterPosition = () => {
        const center = ol.proj.toLonLat(map.getView().getCenter());
        return { lng: center[0], lat: center[1] };
    };

    categoryButtons.forEach((cBtn) => {
        const categoryCode = cBtn.getAttribute('data-category');

        // 마커 레이어 생성 (비동기적으로 생성)
        createCategoryLayer(getCenterPosition(), categoryCode).then((layer) => {
            layers[categoryCode] = layer;
            map.addLayer(layer);

            // 버튼 클릭 이벤트 처리
            cBtn.addEventListener('click', () => {
                const isActive = cBtn.classList.contains('active');

                if (isActive) {
                    // 버튼 비활성화
                    cBtn.classList.remove('active');
                    layers[categoryCode].setVisible(false);
                } else {
                    // 모든 버튼 비활성화
                    categoryButtons.forEach((btn) => btn.classList.remove('active'));
                    Object.values(layers).forEach((layer) => layer.setVisible(false));

                    // 클릭된 버튼 활성화
                    cBtn.classList.add('active');

                    // 새 레이어 생성
                    createCategoryLayer(getCenterPosition(), categoryCode).then((updatedLayer) => {
                        // 기존 레이어 제거 및 새 레이어 추가
                        map.removeLayer(layers[categoryCode]);
                        layers[categoryCode] = updatedLayer;

                        map.addLayer(updatedLayer);
                        updatedLayer.setVisible(true);

                        map.render();
                    });
                }
            });
        });
    });

    // 지도 이동 후 레이어 업데이트
    map.on('moveend', async () => {
        const activeButton = document.querySelector('.category.active');
        if (activeButton) {
            const activeCategoryCode = activeButton.getAttribute('data-category');
            await updateCategoryLayers(map, layers, activeCategoryCode);
        }
    });
};

// 현재 위치로 이동 버튼 설정
const handleCurrentLocationBtn = () => {
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

// 라인 토글
const handleSubwayLineToggle = () => {
    const line1Toggle = document.getElementById('ol-line1');
    const line2Toggle = document.getElementById('ol-line2');
    let line1Layer = null;
    let line2Layer = null;

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
const handlePolygonToggle = () => {
    const polygonToggleBtn = document.querySelector('.ol-polygon-btn'); // 버튼 선택
    let polygonLayer = null;

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
const handleMarkerClick = (e) => {
    const feature = map.forEachFeatureAtPixel(e.pixel, (feat) => {
        // Poi 타입인지 확인 (마커만 처리)
        return feat.getGeometry().getType() === 'Point' ? feat : null;
    });

    if (feature && feature.getProperties()) {
        const infoHTML = createOlInfoHTML(feature.getProperties());
        const infoContainer = document.getElementById('ol-info-container');
        infoContainer.innerHTML = infoHTML;
    }
};

// 지도 초기화
initializeMap().catch((error) => {
    console.error('Error during map initialization:', error);
});
