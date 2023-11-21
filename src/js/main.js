window.onload = () => {
	var searchText = document.getElementById('searchText')
	var searchedText = ''
	let fn = _.throttle(async (evt) => {
		if (evt.key == 'Enter') {
			location.href = location.protocol + '//' + location.host + location.pathname + '?search=' + evt.target.value
		}
		if (evt.target.value == '') {
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
		}
	}, 1000)
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

function throttle(func, delay) {
	let timeoutId
	return function () {
		const context = this
		const args = arguments
		if (!timeoutId) {
			timeoutId = setTimeout(function () {
				func.apply(context, args)
				timeoutId = null
			}, delay)
		}
	}
}
