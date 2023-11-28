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
		return await fetch(this.apiUrl + param.url, { method: param.method || 'POST', body, headers })
	},
	apiUrl: 'http://127.0.0.1:7700',
	bdrId: '',
}
