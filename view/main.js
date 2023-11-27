AMP.module = {
	AMP_LAYOUT_ID: 'blankLayout',
	AMP_COMMON_MODULE: [], // DEFAULT LOADING PARAMETER
	AMP_TARGET_ID: 'AMP_CONTENT',
	items: [],

	run: async function () {
		let obj = this
		AMP.Api({
			url: 'http://127.0.0.1:7700' + location.pathname,
		})
	},
}
