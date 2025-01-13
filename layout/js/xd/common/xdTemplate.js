// 고도 측정 결과값을 UI 리스트에 추가
function addAltiResultToList(e) {
	const index = objList.children.length + 1;

	let objId = '';
	objList.insertAdjacentHTML('afterbegin', createAltiResultHTML(e, objId, index));
}

// 거리/면적/반경 측정에서 오브젝트 key값을 UI 리스트에 추가
function addObjectKeyToList(_key, _total = null) {
	const objList = document.getElementById('xd-object-list');
	const obj = document.createElement('li');

	// li 생성
	obj.id = _key;
	obj.textContent = `· ${_key}`;
	if (_total !== null) {
		obj.textContent += `_${_total}`;
	}
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

// 고도 측정 결과값 HTML
function createAltiResultHTML(position, objId, index) {
	return `
        <li class="xd-object">
        	<div class="alti-result">
				<h5 class="alti-number">${index}.${objId}</h5>
				<div class="alti-content">
						${position.dObjectAltitude > 0 ? `<p>지면고도 : ${position.dObjectAltitude.toFixed(1)}m</p>` : ''}
						<p>해발고도 : ${position.dGroundAltitude.toFixed(1)}m</p>
				</div>
            </div>
        </li>
    `;
}
