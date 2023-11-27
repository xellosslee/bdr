// place files you want to import through the `$lib` alias in this folder.
export default {
	Api: async function Api(param) {
		let body
		let headers = param.headers || {}
		if (param.data instanceof FormData) {
			body = param.data
		} else {
			body = param.method == 'GET' ? null : JSON.stringify(param.data || {})
			headers['Content-Type'] = 'application/json'
		}
		return await fetch(param.url, { method: param.method || 'POST', body, headers })
	},
}
