var popupImageList = document.getElementById('image-list')
window.onload = () => {
	var searchText = document.getElementById('searchText')
	var searchedText = ''
	var searchedItemUrl = ''
	var autoComplete = document.getElementById('autoComplete')
	var toolBox = document.getElementById('toolBox')
	let likeCntLabel = document.querySelector('div.likeCnt')
	let append = document.getElementById('append')
	let searchWrap = document.querySelector('.searchWrap')
	let fn = _.debounce(async (evt) => {
		if (evt.key == 'Enter' && searchedItemUrl != '') {
			location.href = location.protocol + '//' + location.host + searchedItemUrl
			return
		}
		if (evt.target.value == '') {
			if (searchText.value == '') {
				searchedItemUrl = ''
				if (autoComplete.hasChildNodes) {
					autoComplete.replaceChildren()
				}
				autoComplete.classList.add('empty')
				toolBox.classList.remove('empty')
			}
			return
		}
		var pattern = /([^가-힣\x20])/i
		if (pattern.test(evt.target.value)) {
			console.log('자음,모음만 있는 경우 검색 안함')
			return
		}
		if (evt.target.value && searchedText != evt.target.value) {
			// 단어의 변경이 없으면 재조회 안하도록 수정
			searchedText = evt.target.value
			let data = { search: evt.target.value }
			console.log(data)
			let res = await Api({ url: '/item/fast/search', data })
			let result = await res.json()
			// 검색결과 출력
			console.log(result)
			if (result.code == '00' && result.data.length > 0) {
				autoComplete.classList.remove('empty')
				searchedItemUrl = result.data[0].itemUrl
				autoComplete.innerHTML = result.data
					.map((e) => {
						return `<a class="miniItemLabel" href="${e.itemUrl}"><img class="miniItem" src=${e.imgUrl}/><span>${e.name}</span></a>`
					})
					.join('')
					
				autoCompleteFocusCnt = -1
				toolBox.classList.add('empty')
			} else {
				autoComplete.innerHTML = ''
				searchedItemUrl = ''
				autoComplete.classList.add('empty')
				autoCompleteFocusCnt = -1
			}
		}
	}, 100)
	searchText.onkeyup = fn
	
	let autoCompleteFocusCnt = -1
	function autoCompleteFocusing(evt) {
		let autoCompleteItems = autoComplete.querySelectorAll('.miniItemLabel')
		if (autoCompleteItems.length > 0) {
			if (evt.key == 'Escape') {
				autoComplete.classList.add('empty')
				autoCompleteFocusCnt = -1
				return
			}
			if (evt.key == 'ArrowDown') {
				if (autoCompleteFocusCnt < 0) {
					autoCompleteFocusCnt = 0
					autoCompleteItems[autoCompleteFocusCnt].focus()
				} else if (autoCompleteFocusCnt < autoCompleteItems.length - 1) {
					autoCompleteFocusCnt++
					autoCompleteItems[autoCompleteFocusCnt].focus()
				} else if (autoCompleteFocusCnt == autoCompleteItems.length - 1) {
					autoCompleteItems[autoCompleteFocusCnt].focus()
					autoCompleteFocusCnt = autoCompleteItems.length - 1
				}
			} else if (evt.key == 'ArrowUp') {
				if (autoCompleteFocusCnt == autoCompleteItems.length - 1) {
					autoCompleteFocusCnt--
					autoCompleteItems[autoCompleteFocusCnt].focus()
				} else if (autoCompleteFocusCnt > 0) {
					autoCompleteFocusCnt--
					autoCompleteItems[autoCompleteFocusCnt].focus()
				} else if (autoCompleteFocusCnt == 0) {
					autoCompleteItems[autoCompleteFocusCnt].focus()
					autoCompleteFocusCnt = 0
				}
			}
		}
	}
	searchWrap.onkeyup = autoCompleteFocusing

	function toolboxToggle(evt) {
		if (searchWrap.contains(evt.target)) {
			autoComplete.classList.remove('empty')
			if (searchText.value == '') {
				toolBox.classList.remove('empty')
			}
		} else {
			autoComplete.classList.add('empty')
			toolBox.classList.add('empty')
			autoCompleteFocusCnt = -1
		}
	}
	document.body.onclick = toolboxToggle

	let inputCounts = document.querySelectorAll('input[data-earn-input]')
	for (let i = 0; i < inputCounts.length; i++) {
		inputCounts[i].onkeyup = changeInput
	}
	function changeInput(evt) {
		let earnId = evt.target.dataset.earnInput
		let tempValue = 0
		let inputCounts = document.querySelectorAll('input[data-earn-id="' + earnId + '"]')
		tempValue = evt.target.value.replace(/[^0-9]/g, '')
		if (tempValue < 0) {
			tempValue = 0
			evt.target.value = tempValue
			return
		}
		if (tempValue > 99999) {
			tempValue = 99999
			evt.target.value = comma(tempValue)
			return
		}
		for (let i = 0; i < inputCounts.length; i++) {
			inputCounts[i].value = comma(Number(inputCounts[i].dataset.oriValue) * Number(tempValue))
		}
		evt.target.value = comma(tempValue)
	}

	let likeButton = document.querySelectorAll('button.btn.success')
	let dislikeButton = document.querySelectorAll('button.btn.reverse')
	for (let i = 0; i < likeButton.length; i++) {
		likeButton[i].onclick = likeSet
	}
	for (let i = 0; i < dislikeButton.length; i++) {
		dislikeButton[i].onclick = likeSet
	}
	async function likeSet(evt) {
		let a = evt.currentTarget.dataset.itemId
		let b = evt.currentTarget.dataset.value
		if (!a || !b) {
			return
		}
		let res = await Api({ url: '/item/like-set', data: { itemId: a, like: b } })
		let result = await res.json()
		if (result.code == '00') {
			if (b == '1') {
				likeCntLabel.textContent = (Number(likeCntLabel.textContent) + 1).toString()
			} else {
				likeCntLabel.textContent = (Number(likeCntLabel.textContent) - 1).toString()
			}
		} else if (result.code == '01') {
			alert(result.message)
		}
	}

	let bookmarkBtn = document.querySelector('button.btn.bookmark')
	let bookmarkIcon = bookmarkBtn.querySelector('i')
	let bookmark = JSON.parse(localStorage.getItem('bookmark'))

	// 최초 화면 렌더링 시 현재 아이템의 북마크 여부 체크
	function isBookmarked() {
		let newBookmark = JSON.stringify(bookmarkBtn.dataset)
		if (bookmark.indexOf(newBookmark) != -1) {
			bookmarkIcon.classList.remove('icon-bookmark')
			bookmarkIcon.classList.add('icon-bookmark-fill')
		}
	}
	isBookmarked()

	// 북마크 리스트 표시
	function setBookmarkList(init) {
		let bookmarkList = document.getElementById('bookmarkList')
		bookmarkList.replaceChildren()
		if (Array.isArray(bookmark) && bookmark.length > 0) {
			for (let i = 0; i < bookmark.length; i++) {
				let item = JSON.parse(bookmark[i])
				bookmarkList.innerHTML += `<a class="miniItemLabel" href="/item/${item.itemCd}"><img class="miniItem" src="${item.imgUrl}"><span>${item.name}</span></a>`
			}
		} else {
			bookmarkList.innerHTML = '<span class="notExist">아직 북마크가 없습니다.</span>'
		}
	}
	setBookmarkList(1)

	// 북마크 추가/삭제
	function addBookmark(evt) {
		let bookmarkIcon = evt.currentTarget.querySelector('i')
		let newBookmark = JSON.stringify(evt.currentTarget.dataset)
		if (bookmark.length > 9) {
			alert('북마크는 최대 10개까지 가능합니다.')
			return
		}
		let status = ''
		if (bookmark.indexOf(newBookmark) != -1) {
			// 다시 클릭하면 북마크에서 삭제
			bookmark.splice(bookmark.indexOf(newBookmark), 1)
			status = '삭제'
		} else {
			bookmark.push(newBookmark)
			status = '추가'
		}
		localStorage.setItem('bookmark', JSON.stringify(bookmark))
		bookmarkIcon.classList.toggle('icon-bookmark')
		bookmarkIcon.classList.toggle('icon-bookmark-fill')
		setBookmarkList(0)
		alert(`북마크 ${status} 되었습니다.`)
	}

	bookmarkBtn.onclick = addBookmark

	// async function appendFn(evt) {
	// 	let a = evt.currentTarget.dataset.itemId
	// 	let b = evt.currentTarget.dataset.itemCd
	// 	if (!a) {
	// 		return
	// 	}
	// 	let res = await Api({ url: '/item/append', data: { itemId: a, itemCd: b } })
	// 	let result = await res.json()
	// 	if (result.code == '00') {
	// 		console.log(result.data)
	// 	}
	// }
	// append.onclick = appendFn

	// 이미지 목록 조회
	// Api({ url: '/file/list', data: { page: 0 } }).then(async (e) => console.log(await e.json()))
	// 이미지 목록 검색
	// Api({ url: '/file/list', data: { page: 0, name: '뾰족' } }).then(async (e) => console.log(await e.json()))
}

function bookmark(evt) {
	let bookmarkIcon = evt.currentTarget.querySelector('i')
	let bookmark = JSON.parse(localStorage.getItem('bookmark'))
	let newBookmark = JSON.stringify(evt.currentTarget.dataset)
	if (!Array.isArray(bookmark)) {
		bookmark = []
	}
	if (bookmark.length > 9) {
		alert('북마크는 최대 10개까지 가능합니다.')
		return
	}
	if (bookmark.indexOf(newBookmark) != -1) {
		// 다시 클릭하면 북마크에서 삭제
		bookmark.splice(bookmark.indexOf(newBookmark), 1)
	} else {
		bookmark.push(newBookmark)
	}
	localStorage.setItem('bookmark', JSON.stringify(bookmark))
	bookmarkIcon.classList.toggle('icon-bookmark')
	bookmarkIcon.classList.toggle('icon-bookmark-fill')
}

// 이미지 파일명에서 이름 추출
function setImageName(idx) {
	let image = document.getElementById('image' + idx)
	let imageName = document.getElementById('imageName' + idx)
	if (image.files.length > 0) {
		imageName.value = image.files[0].name.split('.')[0].replace(/ /gi, '_')
	} else {
		imageName.value = ''
	}
}
// 이미지 업로드
async function doUpload(idx) {
	let image = document.getElementById('image' + idx)
	let imageName = document.getElementById('imageName' + idx)
	if (image.files.length == 0) {
		return alert('이미지가 없습니다.')
	}
	if (imageName.value == '') {
		return alert('이미지 명칭을 적어주세요.')
	}
	let data = new FormData()
	data.append('image', image.files[0])
	data.append('name', imageName.value)
	let res = await Api({ url: '/file/put', data })
	let result = await res.json()
	console.log(result)
}
// 수정 팝업
function openEditLayer(evt) {
	if (!evt.currentTarget.dataset.itemId) {
		return alert('화면이 정상적으로 로드 되지 않았습니다.\n새로 고침 후 진행해 주시기 바랍니다.')
	}
	let itemContent = document.querySelector('.content[data-item-id="' + evt.currentTarget.dataset.itemId + '"]')
	if (!itemContent) {
		return alert('화면이 정상적으로 로드 되지 않았습니다.\n새로 고침 후 진행해 주시기 바랍니다.')
	}
	itemSetPopup(itemContent)
	let layerEdit = document.getElementById('layerEdit')
	if (layerEdit) {
		layerEdit.classList.remove(...['show', 'hide'])
		layerEdit.classList.add('show')
	}
}
// 수정 팝업 닫기
function editLayerClose(evt) {
	let layerEdit = document.getElementById('layerEdit')
	if (layerEdit) {
		layerEdit.classList.remove(...['show', 'hide'])
		layerEdit.classList.add('hide')
	}
}
function itemSetPopup(itemContent) {
	document.querySelector('#layerEdit > .contentBox .inputWrap.name input').value = itemContent.querySelector('.itemName').textContent
	document.querySelector('#layerEdit > .contentBox .inputWrap.desc textarea').value = decodeURI(itemContent.querySelector('.itemDesc').innerHTML.replace(/<br>/gi, '\n'))
	// debugger
}
async function Api(param) {
	let body
	let headers = {
		bdrId: getCookie('bdrId'),
	}
	if (param.data instanceof FormData) {
		body = param.data
	} else {
		body = param.method == 'GET' ? null : JSON.stringify(param.data || {})
		headers['Content-Type'] = 'application/json'
	}
	return await fetch(param.url, { method: param.method || 'POST', body, headers })
}
function setCookie(p) {
	if (typeof p !== 'object' || !p.key || !p.value || !p.expiresDay) {
		throw 'setCookie 파라미터는 { key, value, expiresDay } 오브젝트로 전달해야 합니다.'
	}
	if (p.expiresDay == null) {
		let d = new Date()
		d.setDate(d.getDate() + p.expiresDay)
		p.expires = d.toUTCString()
	}
	document.cookie = p.key + '=' + p.value + '; expires=' + p.expires
}
function getCookie(p) {
	if (typeof p !== 'string' && (typeof p !== 'object' || !p.key)) {
		throw 'getCookie 파라미터는 string 혹은 { key } 오브젝트로 전달해야 합니다.'
	}
	let key = typeof p === 'object' ? p.key : p
	let cookies = document.cookie.split(';')
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].indexOf(key) > -1) {
			return cookies[i].split('=')[1]
		}
	}
}
function comma(x) {
	if (typeof parseInt(x) != 'number') {
		return
	}
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

async function imageSearch(event) {
	let name = event.target.value
	console.log('searchText', name)

	let res = await Api({ url: '/file/list', data: { name, page: 0 } })
	let result = await res.json()
	console.log(result)
	popupImageList.innerHTML = ''
	if (result.code == '00' && Array.isArray(result.data?.rows)) {
		result.data.rows.forEach((e) => {
			popupImageList.innerHTML += `<option value="${e.fileId}">${e.name}</option>`
		})
	}
}
