// place files you want to import through the `$lib` alias in this folder.
export default {
	api: async function api(param) {
		let body
		let headers = {
			...(param.headers || {}),
		}
		if (param.data instanceof FormData) {
			body = param.data
		} else {
			body = param.method == 'GET' ? null : JSON.stringify(param.data || {})
			headers['Content-Type'] = 'application/json'
		}
		let response = await fetch(param.url, { method: param.method || 'POST', body, headers })
		let res = await response.json()
		if (res.code == '00') {
			// do global api action
		}
		return res
	},
}
