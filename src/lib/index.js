// place files you want to import through the `$lib` alias in this folder.

// bigint로 된 컬럼을 json으로 전달 할 때 string 자료형으로 전달하도록 일괄 적용
// response data에서 string으로 뽑아서 써야 함
BigInt.prototype.toJSON = function () {
	return this.toString()
}
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
