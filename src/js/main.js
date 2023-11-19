window.onload = () => {
	var searchText = document.getElementById('searchText')
	searchText.onkeydown = function (evt) {
		if (evt.key == 'Enter') {
			location.href = location.protocol + '//' + location.host + location.pathname + '?search=' + evt.target.value
		}
	}
}
