window.onload = () => {
	var searchText = document.getElementById('searchText')
	var searchedText = ''
	var searchedItemUrl = ''
	var autoComplete = document.getElementById('autoComplete')
	let likeCntLabel = document.querySelector('div.likeCnt')
	let bookmarkBtn = document.querySelector('button.bookmark')
	let append = document.getElementById('append')
	let fn = _.debounce(async (evt) => {
		if (evt.key == 'Enter' && searchedItemUrl != '') {
			location.href = location.protocol + '//' + location.host + searchedItemUrl
			return
		}
		if (evt.target.value == '') {
			if (searchText.value == '') {
				searchedItemUrl = ''
				autoComplete.classList.add('empty')
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
						return `<div class="miniItemLabel"><a href="${e.itemUrl}"><img class="miniItem" src=${e.imgUrl}/><span>${e.name}</span></a></div>`
					})
					.join('')
			} else {
				searchedItemUrl = ''
				autoComplete.classList.add('empty')
			}
		}
	}, 100)
	searchText.onkeyup = fn

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

	let bookmarkBtns = document.querySelectorAll('button.btn.bookmark')
	function bookmark(item) {
		localStorage.setItem('bookmark', JSON.stringify(evt.currentTarget.dataset))
	}
	for (let i = 0; i < bookmarkBtns.length; i++) {
		bookmarkBtns[i].onclick = bookmark
	}
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
}

async function Api(param) {
	return await fetch(param.url, {
		method: param.method || 'POST',
		body: param.method == 'GET' ? null : JSON.stringify(param.data || {}),
		headers: {
			'Content-Type': 'application/json',
			bdrId: getCookie('bdrId'),
		},
	})
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
