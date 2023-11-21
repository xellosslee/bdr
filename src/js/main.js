window.onload = () => {
	var searchText = document.getElementById('searchText')
	var searchedText = ''
	var searchedItemUrl = ''
	var autoComplete = document.getElementById('autoComplete')
	let fn = _.debounce(async (evt) => {
		if (evt.key == 'Enter' && searchedItemUrl != '') {
			location.href = location.protocol + '//' + location.host + searchedItemUrl
		}
		if (evt.target.value == '') {
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
			let res = await fetch('/item/fast/search', { method: 'POST', body: JSON.stringify(data) })
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
	}, 300)
	searchText.onkeyup = fn

	let inputCounts = document.querySelectorAll('input[data-earn-input]')
	for (let i = 0; i < inputCounts.length; i++) {
		inputCounts[i].onkeyup = changeInput
	}
	function changeInput(evt) {
		let earnId = evt.target.dataset.earnInput
		let inputCounts = document.querySelectorAll('input[data-earn-id="' + earnId + '"]')
		for (let i = 0; i < inputCounts.length; i++) {
			inputCounts[i].value = Number(inputCounts[i].dataset.oriValue) * Number(evt.target.value)
		}
	}
}
