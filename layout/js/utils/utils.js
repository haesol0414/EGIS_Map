// 별점 그리기
export function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += `<span class="star full"></span>`;
    }

    if (halfStar) {
        starsHtml += `<span class="star half"></span>`;
    }

    for (let i = 0; i < emptyStars; i++) {
        starsHtml += `<span class="star empty"></span>`;
    }

    return starsHtml;
}

// 주소 판단
export function isAddress(keyword) {
    return /\d/.test(keyword) && /\s/.test(keyword);
}

// 현재 위치를 가져오는 함수
export function getUserPosition(successCallback, errorCallback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const userPosition = { lng: coords.longitude, lat: coords.latitude };
                successCallback(userPosition);
            },
            errorCallback || (() => alert('현재 위치를 가져올 수 없습니다.'))
        );
    } else {
        alert('Geolocation을 지원하지 않습니다.');
    }
}
