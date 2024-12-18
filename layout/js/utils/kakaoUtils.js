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