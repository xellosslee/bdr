// place files you want to import through the `$lib` alias in this folder.
export default {
	api: async function api(param) {
		let body
		let headers = {
			...(param.headers || {}),
			bdrId: this.bdrId,
		}
		if (param.data instanceof FormData) {
			body = param.data
		} else {
			body = param.method == 'GET' ? null : JSON.stringify(param.data || {})
			headers['Content-Type'] = 'application/json'
		}
		let response = await fetch(this.apiUrl + param.url, { method: param.method || 'POST', body, headers })
		let res = await response.json()
		if (res.code == '00' && res.bdrId) {
			cookieStore.set({
				name: 'bdrId',
				value: res.bdrId,
				expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
				domain: location.hostname,
			})
		}
		return res
	},
	apiUrl: 'http://127.0.0.1:7700',
}
