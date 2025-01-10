// 고도 측정 결과값 리스트 표시
function createAltiResultHTML(position, index) {
	return `
        <li class="alti-wrap">
            <h5 class="alti-number">${index}.</h5>
            <div class="alti-content">
                <div class="alti-position">
                    ${position.dObjectAltitude > 0 ? `<p>지면고도 : ${position.dObjectAltitude.toFixed(1)}m</p>` : ''}
                    <p>해발고도 : ${position.dGroundAltitude.toFixed(1)}m</p>
                </div>
                <div class="alti-position">
                    <span>Lon : ${position.dLon.toFixed(6)}</span>
                    <span>Lat : ${position.dLat.toFixed(6)}</span>
                    <p>Alt : ${position.dAlt.toFixed(6)}</p>
                </div>
            </div>
        </li>
    `
}

// 반경 측정 결과값 표시
function createRadiusResultHTML(position, totalDistance) {
	console.log(position, totalDistance);

	return `
        <li class="alti-wrap">
            <div class="alti-content">
                <div class="alti-result">
                    <span>${totalDistance}</span>
                </div>
                <div class="alti-position">
                    <span>${position}</span>
                </div>
            </div>
        </li>
    `
}

// 고도 측정 결과값을 UI 리스트에 추가
function addAltiResultToList(e) {
	const index = objList.children.length + 1;

	objList.insertAdjacentHTML('afterbegin', createAltiResultHTML(e, index));
}

// 거리/면적 측정에서 오브젝트 key값을 UI 리스트에 추가
function addObjectKeyToList(_key) {
	const objList = document.getElementById('xd-object-list');
	const obj = document.createElement('li');

	// li 생성
	obj.id = _key;
	obj.textContent = `· ${_key}`;
	obj.classList.add('xd-object');

	// 삭제 버튼 추가
	const deleteBtn = createDeleteButton(_key);
	obj.appendChild(deleteBtn); // 리스트 항목에 삭제 버튼 추가

	objList.appendChild(obj);   // 리스트에 항목 추가
}

// 삭제 버튼 생성 및 이벤트 처리 함수
function createDeleteButton(_key) {
	const deleteBtn = document.createElement('button');
	deleteBtn.textContent = '삭제';
	deleteBtn.classList.add('xd-del-btn');

	deleteBtn.addEventListener('click', () => {
		clearObject(_key);
	});

	return deleteBtn;
}