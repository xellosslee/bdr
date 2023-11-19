window.onload = () => {
	var searchText = document.getElementById('searchText')
	searchText.onkeyup = async function (evt) {
		if (evt.target.value == '') {
			return
		}
		if (evt.target.value) {
			_.throttle(async () => {
				let data = { search: evt.target.value }
				console.log(data)
				let res = await fetch('/item/fast/search', { method: 'POST', body: JSON.stringify(data) })
				let result = await res.json()
				// 검색결과 출력
				console.log(result)
			}, 500)()
		}
		if (evt.key == 'Enter') {
			location.href = location.protocol + '//' + location.host + location.pathname + '?search=' + evt.target.value
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
