window.onload = () => {
	var searchText = document.getElementById('searchText')
	let fn = _.throttle(async (evt) => {
		if (evt.key == 'Enter') {
			location.href = location.protocol + '//' + location.host + location.pathname + '?search=' + evt.target.value
		}
		if (evt.target.value == '') {
			return
		}
		if (evt.target.value) {
			let data = { search: evt.target.value }
			console.log(data)
			let res = await fetch('/item/fast/search', { method: 'POST', body: JSON.stringify(data) })
			let result = await res.json()
			// 검색결과 출력
			console.log(result)
		}
	}, 500)
	searchText.onkeyup = fn
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
