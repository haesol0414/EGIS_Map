// 오브젝트 key값을 UI 리스트에 추가
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

function createDetailPopup(_key, _name, _description) {
	const wrapper = document.getElementById('xd-map-tool');

	// 기존 팝업 제거 (중복 방지)
	const existingPopup = wrapper.querySelector('.detail-wrap');
	if (existingPopup) {
		existingPopup.remove();
	}

	// 팝업 요소 생성
	const detailWrap = document.createElement('div');
	detailWrap.className = 'detail-wrap';
	detailWrap.innerHTML = `
        <div class="detail-top">
            <h5 class="xd-detail-title">상세보기</h5>
            <button class="xd-close-btn">X</button>
        </div>
        <div>
            <span class="text title">ID </span><span class="obj-key">${_key}</span>
        </div>
        <div>
            <span class="text title">Name </span><span class="detail-obj-name">${_name}</span>
        </div>
        <div>
            <span class="text title">Description </span><span class="detail-obj-description">${_description}</span>
        </div>
    `;

	// 닫기 버튼 이벤트 추가
	detailWrap.querySelector('.xd-close-btn').addEventListener('click', () => {
		detailWrap.remove(); // 팝업 닫기
	});

	// #xd-map-tool 안에 맨 마지막 요소로 팝업 추가
	wrapper.appendChild(detailWrap);
}
