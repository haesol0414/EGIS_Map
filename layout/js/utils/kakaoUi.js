import {generateStars} from './kakaoUtils.js';
export function createMarkerHTML(index) {
    return `
        <div class="marker" 
            style="width:30px; height:40px; 
            background:url('https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png') no-repeat; 
            background-size:cover; cursor: pointer;"
            data-index="${index}"
            tabindex="-1">
        </div>
    `;
}

export function createOverlayHTML(place, rating) {
    return `
        <div class="info-window" tabindex="-1">
            <div class="place-name">
                <p class="info-title">${place.place_name ? place.place_name : '건물명 없음'}</p>
                <span class="place-category">${place.category_name?.split(' > ').pop() || ''}</span>
            </div>
            <div class="place-rating">
                ${generateStars(rating)}
                <span class="rating-value">${rating}</span>
            </div>
            <p class="info-road-address">${place.road_address_name || '도로명 주소 없음'}</p>
            <div class="info-address">
                <span class="sticker">지번</span>
                <span>${place.address_name || '지번 주소 없음'}</span>
            </div>
            <span class="info-tel">${place.phone || '전화번호 없음'}</span>
            <div class="service">
                <a href="${place.place_url}" target="_blank" class="info-detail" tabindex="-1">상세보기</a>
            </div>
        </div>
    `;
}

export function createBadgeHTML(index, place) {
    return `
        <div class="badge" tabindex="-1">
            <span class="badge-idx">${String.fromCharCode(65 + index)}. </span>
            <span class="badge-title">${place.place_name ? place.place_name : '건물명 없음'}</span>
        </div>
    `;
}

// 검색 결과 li
export function createListItemHTML(place, index, rating) {
    const markerLabel = String.fromCharCode(65 + index);

    const isAddressSearch = place.address || place.road_address;

    const placeName = isAddressSearch
        ? (place.road_address?.building_name || '건물명 없음')
        : place.place_name;

    const roadAddress = isAddressSearch
        ? (place.road_address?.address_name || '도로명 주소 없음')
        : place.road_address_name;

    const addressName = isAddressSearch
        ? (place.address?.address_name || '지번 주소 없음')
        : place.address_name;

    const categoryName = place.category_name?.split(' > ').pop() || '';

    return `
        <li class="search-result-item" data-marker-index="${index}">
            <div class="place-title">
                <span class="place-idx">${markerLabel}.</span>
                <div class="place-name">
                    <span class="place-link">${placeName}</span>
                    <span class="place-category">${categoryName}</span>
                </div>
            </div>
            <div class="place-rating">
                ${generateStars(rating)}
                <span class="rating-value">${rating}</span>
            </div>
            <p class="road-address-name">${roadAddress}</p>
            <p class="address-name">
                <span class="sticker">지번</span>
                ${addressName}</p>
            <div class="place-detail">
                <p class="tel">${place.phone || '전화번호 없음'}</p>
                <a href="${place.place_url}" target="_blank" class="detail-link">상세보기</a>
            </div>
        </li>
    `;
}