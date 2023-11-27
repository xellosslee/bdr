/** Util Functions */
var AMP = Object.assign(AMP || {}, {
	/** 전역적으로 특정 변수에 맵핑되는 함수들 선언 */
	setGlobalFunctions: function () {
		String.prototype.replaceAll = function (target, replacement) {
			return this.split(target).join(replacement)
		}
		String.prototype.unescape = function () {
			return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
		}
		String.prototype.unicodeOnly = function () {
			return this.replace(/[^\w+]/g, '')
		}
		String.prototype.numberOnly = function () {
			return this.replace(/[^0-9]/g, '')
		}
		String.prototype.byteLength = function () {
			var l = 0
			for (var idx = 0; idx < this.length; idx++) {
				var c = escape(this.charAt(idx))

				if (c.length == 1) l++
				else if (c.indexOf('%u') != -1) l += 2
				else if (c.indexOf('%') != -1) l += c.length / 3
			}
			return l
		}
		String.prototype.cutStringByte = function (len) {
			var l = 0
			for (var i = 0; i < this.length; i++) {
				l += this.charCodeAt(i) > 128 ? 2 : 1
				if (l > len) return this.substring(0, i)
			}
		}
		String.prototype.yearDateFormat = function () {
			var date = this.numberOnly()
			if (date.length != 8) return this

			return dayjs(date).format('YYYY-MM-DD')
		}
		String.prototype.timeFormat = function () {
			var replaceTime = this.replace(/\:/g, '')
			if (replaceTime.length >= 4 && replaceTime.length < 5) {
				var hours = replaceTime.substring(0, 2)
				var minute = replaceTime.substring(2, 4)
				return hours + ':' + minute
			}
		}
		Date.prototype.format = function (f) {
			if (!this.valueOf()) return ' '
			var weekKorName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
			var weekKorShortName = ['일', '월', '화', '수', '목', '금', '토']
			var weekEngName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
			var weekEngShortName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
			var d = this
			let h
			return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|ms|mi|a\/p)/gi, function (e) {
				switch (e) {
					case 'yyyy':
						return d.getFullYear() // 년 (4자리)
					case 'yy':
						return (d.getFullYear() % 1000).zf(2) // 년 (2자리)
					case 'MM':
						return (d.getMonth() + 1).zf(2) // 월 (2자리)
					case 'dd':
						return d.getDate().zf(2) // 일 (2자리)
					case 'KS':
						return weekKorShortName[d.getDay()] // 요일 (짧은 한글)
					case 'KL':
						return weekKorName[d.getDay()] // 요일 (긴 한글)
					case 'ES':
						return weekEngShortName[d.getDay()] // 요일 (짧은 영어)
					case 'EL':
						return weekEngName[d.getDay()] // 요일 (긴 영어)
					case 'HH':
						return d.getHours().zf(2) // 시간 (24시간 기준, 2자리)
					case 'hh':
						return ((h = d.getHours() % 12) ? h : 12).zf(2) // 시간 (12시간 기준, 2자리)
					case 'mm':
						return d.getMinutes().zf(2) // 분 (2자리)
					case 'ss':
						return d.getSeconds().zf(2) // 초 (2자리)
					case 'ms':
						return d.getMilliseconds() // ms (3자리)
					case 'mi':
						return d.getMilliseconds().zf(3) // ms (고정 3자리)
					case 'a/p':
						return d.getHours() < 12 ? '오전' : '오후' // 오전/오후 구분
					default:
						return e
				}
			})
		}
		String.prototype.string = function (len) {
			var s = '',
				i = 0
			while (i++ < len) {
				s += this
			}
			return s
		}
		String.prototype.zf = function (len) {
			return '0'.string(len - this.length) + this
		}
		Number.prototype.zf = function (len) {
			return this.toString().zf(len)
		}
		String.prototype.toBoolean = function () {
			return ['true', 'yes', 'y', '1'].indexOf(this.toLowerCase()) > -1 ? true : false
		}
		Number.prototype.toBoolean = function () {
			return this > 0 ? true : false
		}
		Boolean.prototype.toBoolean = function () {
			return this
		}
	},
	/** 순차 실행 함수 */
	waterfall: function (tasks, callback) {
		var obj = this
		var ct = 0
		var MAX_CT = events.length
		tasks()
		superArgs[0](callback)
	},
	/** n개 함수 동시 실행 후 마지막 함수만 후순위로 호출하는 함수 */
	eventChain: function () {
		var obj = this
		var ct = 0
		var superArgs = arguments
		if (typeof superArgs[0] == 'function') {
		} else if (typeof superArgs[0] == 'object' || superArgs[0].length > 0) {
			superArgs = superArgs[0]
		}
		var MAX_CT = superArgs.length
		var elist = []
		// for (var i = 0; i < superArgs.length; i++) {
		//     elist.push(superArgs[i]);
		// }
		// var lastCall = function () {
		//     ct++;
		//     if (elist.length > ct) {
		//         elist[ct](lastCall);
		//     }
		// };
		// superArgs[0](lastCall);

		var i = 0
		var max = MAX_CT - 1
		var goNext = true
		var atCount = 0
		window.ampEventChainIF = function () {
			// console.log("check! " + i +"," + goNext);
			// console.log(window.ampEventChainIF);
			if (goNext) {
				atCount = 0
				goNext = false
				// console.log("이벤트 실행 A(" + i + ")");
				superArgs[i](function () {
					if (max >= 1) {
						// console.log("이벤트 실행 B(" + i + ")");
						superArgs[i + 1](function () {
							i = i + 2
							if (i < max) {
								goNext = true
								window.ampEventChainIF()
								// console.log("결과A");
							} else {
								console.log(i + ',' + max)

								if ((max + 1) % 2 == 1) {
									// console.log("결과c");
									superArgs[max](function () {
										// console.log("종료!");
									})
								}
								// clearInterval(window.ampEventChainIF);
							}
						})
					} else {
						// clearInterval(window.ampEventChainIF);
					}
				})
			} else {
				atCount++

				// if(atCount >= 10){
				//     console.log("종료!");
				//     // clearInterval(window.ampEventChainIF);
				// }
			}
		}

		setTimeout(window.ampEventChainIF, 100)
	},
	/** n개 함수 동시 실행 후 마지막 함수만 후순위로 호출하는 함수 */
	eventRun: function () {
		var ct = 0
		var superArgs = arguments
		var MAX_CT = superArgs.length - 1
		var lastEvent = arguments[arguments.length - 1]

		if (typeof superArgs[0] == 'function') {
		} else if (typeof superArgs[0] == 'object' || superArgs[0].length > 0) {
			superArgs = arguments[0]
			//console.log(superArgs);
			MAX_CT = Object.keys(superArgs).length
		}

		var lastCall = function () {
			ct++
			if (ct == MAX_CT) lastEvent()
		}

		for (var i = 0; i < MAX_CT; i++) {
			var func = superArgs[i](lastCall)
		}
	},
	/** 임의의 문자 리턴 */
	randomString: function (min, max) {
		min = min || 7
		max = max || 10
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789'
		var string_length = Math.floor(Math.random() * (max - min + 1) + min)
		var result = ''
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length)
			result += chars.substring(rnum, rnum + 1)
		}
		return result
	},
	/** 텍스트에서 해당 문자열과 일치하는 라인을 리턴 */
	getMatchedLine: function (str, data) {
		var obj = this
		var rs = []

		//파싱
		var arr = data.split('\n')
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].indexOf(str) != -1) {
				rs.push(arr[i])
			}
		}
		return rs
	},
	/** [] 안의 데이터를 찾아서 리턴 (패턴매칭) */
	patterSearchCustom1: function (str) {
		var found = str
			.match(/\[(.*?)\]/)[1]
			.replaceAll('"', '')
			.replaceAll(' ', '')
		var rs = []
		// console.log(found);
		var sca = found.split(',')
		for (var j = 0; j < sca.length; j++) {
			rs.push(sca[j])
		}
		return rs
	},
	/** {$} 안의 데이터를 찾아서 리턴 (패턴매칭) */
	patterSearch2: function (str, data) {
		//var found = str.match(/\$\{(.*?)\}/g)
		var result = str.replace(/\$\{([a-zA-Z\_0-9|s]*)\}/g, function (match, token) {
			// console.log(data);
			// console.log(token);
			if (typeof data[token] === 'undefined') return match
			else return data[token]
		})
		return result
	},
	/** HTML구문 변환 */
	htmlEntityEnc: function (str) {
		if (str == '' || str == null) {
			return str
		} else {
			return str
				.replace('&', '&amp;')
				.replace('#', '&#35;')
				.replace('<', '&lt;')
				.replace('>', '&gt;')
				.replace(/"/g, '&quot;')
				.replace('\\', '&#39;')
				.replace('%', '&#37;')
				.replace('(', '&#40;')
				.replace(')', '&#41;')
				.replace('+', '&#43;')
				.replace('/', '&#47;')
				.replace('.', '&#46;')
		}
	},
	/** JSON parse */
	parseJSON: function (d) {
		var str = ''
		try {
			str = JSON.parse(d)
		} catch (e) {
			console.error('=== AMP JSON parse error ')
			console.error(e)
			return null
		}
		return str
	},
	/** &과 "등의 이슈를 해결한 함수가 필요함 */
	/* 동일 name이 여러개로 들어오는 경우 배열로 변환 */
	paramToJSON: function (str) {
		//20150422 304270 : URL data가 아닌경우 0번째부터 짤라야함.
		var startIdx = 1
		if (str.indexOf('?') != 0) {
			startIdx = 0
		}
		var pairs = str.slice(startIdx).split('&')
		var result = {}
		pairs.forEach(function (pair) {
			pair = pair.split('=')
			if (typeof result[pair[0]] === 'string') {
				result[pair[0]] = [result[pair[0]], decodeURIComponent(pair[1])]
			} else if (typeof result[pair[0]] === 'object') {
				result[pair[0]] = [...result[pair[0]], decodeURIComponent(pair[1])]
			} else {
				result[pair[0]] = decodeURIComponent(pair[1])
			}
		})
		return JSON.parse(JSON.stringify(result))
	},
	/** 맵을 객체 배열로 변환 */
	mapToArr: function (map) {
		var rs = []
		var keys = Object.keys(map)
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var value = map[key]

			rs.push({
				key: key,
				value: value,
			})
		}
		return rs
	},
	/** URI인코딩 변환 */
	escapeParam: function (param) {
		var obj = this
		var keys = Object.keys(param)
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			var value = param[key]
			var value_es = encodeURIComponent(value)
			param[key] = value_es
		}
	},
	/** 문자 안의 확장자 확인 */
	checkFileExtension: function (str) {
		var ar = str.split('.')
		return ar[ar.length - 1]
	},
	/** 날짜 시간 포맷 변경 */
	dateFormat: function (value, startIdx) {
		var obj = this
		if (value == undefined || value == null) {
			return
		}
		if (typeof value == 'string') {
			return value.substring(startIdx == null ? 0 : startIdx, 10) + ' ' + value.substring(11, 16)
		} else if (typeof value == 'object') {
			value = new Date(value.setHours(value.getHours() + 9)).toISOString()
			return value.substring(startIdx == null ? 0 : startIdx, 10) + ' ' + value.substring(11, 16)
		} else if (typeof value == 'number') {
			value = new Date(value)
			value = new Date(value.setHours(value.getHours() + 9)).toISOString()
			return value.substring(startIdx == null ? 0 : startIdx, 10) + ' ' + value.substring(11, 16)
		}
	},
	/** 원화에 콤마 표시 */
	comma: function (x) {
		if (typeof x === 'undefined' || x == null) return x

		if (isNaN(x)) return x

		let part = x.toString().split('.')
		return part[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (part[1] ? '.' + part[1] : '')
	},
	/** 퍼센트 표시 **/
	percent: function (x) {
		var value = AMP.nvl(x)
		if (value.length == 0) return ''
		return Math.round(x * 100) / 100 + ' %'
	},
	// 소수점 2자리까지 표시하도록 정규식 지정
	decimal2: function (v) {
		v.target.value = Number(v.target.value).toFixed(2)
	},
	/** 널체크 후 공백문자 혹은 기본값 리턴 */
	nvl: function (v, nv) {
		if (v == 'undefined') {
			if (typeof nv === 'undefined') return ''
			else return nv
		}

		if (typeof v === 'undefined' || v == null || v == 'null') {
			if (typeof nv === 'undefined') return ''
			else return nv
		} else {
			return v
		}
	},
	/** 좌측에 문자열 채우기 */
	lpad: function (str, padLen, padStr) {
		if (padStr.length > padLen) {
			console.warn('체크 : 채우고자 하는 문자열이 요청 길이보다 큽니다')
			return str
		} else if (padStr.length == 0) {
			console.error('오류 : 채우는 문자가 0이면 무한루프에 빠집니다')
			return str
		}
		str += '' // 숫자인 경우 문자로 변환
		padStr += '' // 숫자인 경우 문자로 변환
		while (str.length < padLen) str = padStr + str
		str = str.length >= padLen ? str.substring(0, padLen) : str
		return str
	},
	/** 우측에 문자열 채우기 */
	rpad: function (str, padLen, padStr) {
		if (padStr.length > padLen) {
			console.warn('체크 : 채우고자 하는 문자열이 요청 길이보다 큽니다')
			return str
		} else if (padStr.length == 0) {
			console.error('오류 : 채우는 문자가 0이면 무한루프에 빠집니다')
			return str
		}
		str += '' // 숫자인 경우 문자로 변환
		padStr += '' // 숫자인 경우 문자로 변환
		while (str.length < padLen) str += padStr
		str = str.length >= padLen ? str.substring(0, padLen) : str
		return str
	},
	/** 문자열 공백 제거 */
	trim: function (str) {
		return str.replace(/^\s+|\s+$/g, '')
	},
	ltrim: function (str) {
		return str.replace(/^\s+/, '')
	},
	rtrim: function (str) {
		return str.replace(/\s+$/, '')
	},
	/** 로컬 스토리지에 저장 (JSON형태, text형태 지원) */
	setStorage: function (key, value) {
		var _preFix = 'AMP_'
		localStorage.setItem(_preFix + key, JSON.stringify(value))
	},
	/** 로컬 스토리지 값 가져오기 (JSON형태, text형태 지원) */
	getStorage: function (key) {
		var _preFix = 'AMP_'
		var rs = AMP.nvl(localStorage.getItem(_preFix + key), '{}')
		return JSON.parse(rs)
	},
	groupBy: function (xs, key) {
		return xs.reduce(function (rv, x) {
			;(rv[x[key]] = rv[x[key]] || []).push(x)
			return rv
		}, {})
	},
	parseJwt: function (token) {
		var base64Url = token.split('.')[1]
		var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		var jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
				})
				.join(''),
		)

		return JSON.parse(jsonPayload)
	},
	deepLoop: function (list, children, func, depth) {
		if (depth == null) {
			depth = { x: 0, y: 0 }
		}
		for (let i = 0; i < list.length; i++) {
			depth.x = i
			func(list[i], depth)
			let subList = list[i][children]
			if (subList != null && subList.length > 0) {
				let subDepth = _.clone(depth)
				subDepth.y++
				this.deepLoop(subList, children, func, subDepth)
			}
		}
	},
	toastMsgShow: function (params) {
		let wrap = document.querySelector('#toastMsgWrap')
		let icon = document.querySelector('#toastIcon')
		let text = document.querySelector('#toastText')
		let styleMap = {
			info: 'circleInfo',
			warn: 'circleWarning',
			error: 'circleWarning',
		}

		if (typeof params.message == 'string') {
			params.message = params.message.replace(/\n/gi, '<br>')
		}
		text.innerHTML = params.message
		if (icon) {
			icon.className = ''
		}
		if (!common.isMobile) {
			wrap.classList.remove('success', 'warn', 'error')
		}
		wrap.classList.remove('active')
		wrap.onclick = function (e) {
			wrap.classList.remove('active')
		}
		setTimeout(function () {
			if (icon) {
				icon.className = 'ico ' + styleMap[params.style || 'info']
			}
			if (!common.isMobile) {
				wrap.classList.add(params.style || 'info')
			}
			wrap.classList.add('active')
		}, 10)
	},

	cutPageArray: function (param, num) {
		if (!Array.isArray(param)) {
			return console.error('cutPageArray : 배열이 아닌 값이 들어옴')
		}
		if (param.length == 0) {
			return []
		}
		let res = []
		let subList = []
		for (i = 0; i < param.length; i++) {
			if (subList.length >= num) {
				res.push(subList)
				subList = []
			}
			subList.push(_.clone(param[i]))
		}
		if (subList.length > 0) {
			res.push(subList)
		}
		return res
	},

	cutPageArrayByValue: function (param, checkValue, num) {
		if (!Array.isArray(param)) {
			return console.error('cutPageArray : 배열이 아닌 값이 들어옴')
		}
		if (param.length == 0) {
			return []
		}
		let res = []
		let subList = []
		var seq = 1
		let temp = param[0][checkValue] || ''
		for (i = 0; i < param.length; i++) {
			if (checkValue && param[i][checkValue] != temp) {
				temp = param[i][checkValue]
				res.push(subList)
				seq = 1
				subList = []
			}
			if (subList.length >= (num || 9999)) {
				res.push(subList)
				subList = []
			}
			param[i].seq = seq
			subList.push(_.clone(param[i]))
			seq++
		}
		if (subList.length > 0) {
			seq = 1
			res.push(subList)
		}
		return res
	},

	cutPageArrayByValues: function (param, checkValues, num) {
		if (!Array.isArray(param)) {
			return console.error('cutPageArray : 배열이 아닌 값이 들어옴')
		}
		if (param.length == 0) {
			return []
		}
		let res = []
		let subList = []
		var seq = 1
		let temp = ''
		for (k = 0; k < checkValues.length; k++) {
			temp += param[0][checkValues[k]]
		}
		for (i = 0; i < param.length; i++) {
			if (checkValues) {
				let key = ''
				for (k = 0; k < checkValues.length; k++) {
					key += param[i][checkValues[k]]
				}
				if (key != temp) {
					temp = key
					res.push(subList)
					seq = 1
					subList = []
				}
			}
			if (subList.length >= (num || 9999)) {
				res.push(subList)
				subList = []
			}
			param[i].seq = seq
			subList.push(_.clone(param[i]))
			seq++
		}
		if (subList.length > 0) {
			seq = 1
			res.push(subList)
		}
		return res
	},

	businessNo: function (no) {
		return no.substr(0, 3) + '-' + no.substr(3, 2) + '-' + no.substr(5)
	},

	//숫자만들기 (,포함)
	toNumber: function (str) {
		if (typeof str === 'undefined') return str

		// if(!isNaN(str)){
		//     return str
		// }

		return Number(str.replaceAll(',', '').replaceAll(',', ''))
	},

	//PDFMAKER전용함수
	checkIsEndPdfFooter: function (callback) {
		if (window.pdfMaker_isEndFooter == true) {
			callback()
		} else {
			setTimeout(function () {
				AMP.checkIsEndPdfFooter(callback)
			}, 100)
		}
	},

	/**
	 * @param {String} val 체크할 비밀번호
	 * @returns {JSON} {passwordLevel, length, lowerCase, upperCase, number, specialChar}
	 */
	checkPasswordComplex: function (val) {
		if (typeof val !== 'string') {
			console.error('checkPasswordComplex param must be string')
			return
		}
		let checkResult = {
			passwordLevel: 0,
			length: val.length,
		}
		// 소문자 체크
		if (/[a-z]/.test(val)) {
			checkResult.passwordLevel++
			checkResult.lowerCase = true
		}
		// 대문자 체크
		if (/[A-Z]/.test(val)) {
			checkResult.passwordLevel++
			checkResult.upperCase = true
		}
		// 숫자 체크
		if (/\d/.test(val)) {
			checkResult.passwordLevel++
			checkResult.number = true
		}
		// 특수문자 체크
		// !”#$%()*+,-./:;ó?@[]^+’{|}~
		if (val.replace(/^[!”#$%()*+,-./:;ó?@\[\]\^+’{|}~]/g, '').length > 0) {
			checkResult.passwordLevel++
			checkResult.specialChar = true
		}
		return checkResult
	},

	checkEmailValidation: function (val) {
		return /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z_-])*@[0-9a-zA-Z]([-]?[0-9a-zA-Z])*\.(([a-zA-Z]{2,6})|(([a-zA-Z]{2,20})+\.([a-zA-Z]{2,20})))$/i.test(val)
	},

	maskingName: function (val) {
		if (typeof val == 'string') {
			if (val.length > 2) {
				return val.substring(0, 1) + '*' + val.substring(2)
			} else if (val.length > 1) {
				return val.substring(0, 1) + '*'
			}
		}
		return val
	},

	maskingEmail: function (val) {
		if (typeof val == 'string') {
			let pos = val.indexOf('@')
			if (pos > 0) {
				let half = Math.floor(pos / 2)
				return '*'.repeat(half) + val.substring(half)
			}
		}
		return val
	},

	maskingEmailCount: function (val, cnt) {
		if (typeof val == 'string') {
			let pos = val.indexOf('@')
			if (pos > 0) {
				if (cnt >= pos) {
					return val
				}
				return val.substring(0, pos - cnt) + '*'.repeat(cnt) + val.substring(pos)
			}
		}
		return val
	},

	// 팝업 쿠키생성
	setCookie: function (param) {
		if (param.path == null || param.path == '') {
			param.path = '/'
		}
		if (param.value == null) {
			param.value = ''
		}
		var d = new Date()
		d = new Date(d.setDate(d.getDate() + (param.addDate || 0)))
		var d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
		document.cookie = param.name + '=' + param.value + ';expires=' + d2.toUTCString() + ';path=' + param.path
	},

	getCookie: function (name) {
		let n = name + '='
		var ca = document.cookie.split(';')
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i]
			while (c.charAt(0) == ' ') {
				c = c.substring(1)
			}
			if (c.indexOf(n) == 0) {
				return c.substring(n.length, c.length)
			}
		}
		return ''
	},

	// ver1 is current version ver2 diff check version
	versionCheck: function (ver1, ver2) {
		if (typeof ver1 != 'string' || typeof ver2 != 'string') {
			return -1
		}
		let versions1 = ver1.split('.')
		let versions2 = ver2.split('.')
		if (versions1.length != 3 || versions2.length != 3) {
			return -1
		}
		if (Number(versions1[0]) < Number(versions2[0])) {
			return 3 // 첫번째 버전값 낮음 - 업데이트 필요
		} else if (Number(versions1[0]) == Number(versions2[0]) && Number(versions1[1]) < Number(versions2[1])) {
			return 2 // 두번째 버전값 낮음 - 업데이트 필요 ?
		} else if (Number(versions1[0]) == Number(versions2[0]) && Number(versions1[1]) == Number(versions2[1]) && Number(versions1[2]) < Number(versions2[2])) {
			return 1 // 세번째 버전값 차이 - 권장 업데이트 ?
		} else {
			return 0 // 버전 동일
		}
	},

	// px to vw 변환. 자리수는 7자리
	convertPixelToVw: function (px, width) {
		return Math.round((px * Math.pow(10, 7)) / (width / 100)) / Math.pow(10, 7)
	},

	distanceText: function (n) {
		if (typeof n == 'number') {
			let m = Math.round(n)
			if (m > 1000 && m < 100000) {
				return Math.round((m * 100) / 1000) / 100 + 'km'
			} else if (m > 100000) {
				return Math.round(m / 1000) + 'km'
			}
			return m + 'm'
		} else {
			return n
		}
	},

	transTime: function (seconds) {
		let n = Number(seconds)
		if (typeof n == 'number') {
			let m = Math.floor(n / 60)
			let s = n - m * 60
			return AMP.lpad(m, 2, '0') + ':' + AMP.lpad(s, 2, '0')
		} else {
			return '00:00'
		}
	},
})

/**
 * 의존성 : icons.min.css, fa-*-900.* 폰트 파일 (fontawsome)
 * 로딩 앞의 아이콘 표시용 (없을 경우 Loading.. 글씨만 나옴)
 * amp_util을 우선 로드 해야 함
 */
var AMP = Object.assign(AMP, {
	version: '5.1.0',
	devMode: true, //다이얼로그 항상 새로고침
	description: 'Web admin(SDMS)구현에 필요한 기능만 추려서 별도로 리팩토링한 버전',
	f: {}, //`모듈 `함수 호출
	hashVersion: false, //모듈name의 url주소 입력 방식을 hash type로 하여 spa에 맞게 refresh없이 화면 전환하는 기능 (third party library들의 로드 순서 때문에 화면 전환 후 클릭이벤트가 발생하지 않는 오류 있음)
	extv: {
		//확장변수
		Lang: 'kr', //언어
		errorPage: '/error.html', // 에러파일경로
		amTitleMap: {}, //모듈별 타이틀 정보
		extData: [], //레이아웃데이터
		extDataPage: {}, //페이지에서만 유효한 레이아웃데이터
		vueData: {}, //로드된 뷰 데이터
		ampLayoutId: '', //하나의 모듈 기준 레이아웃 ㅏㅇ이디
		defaultModule: 'login',
		mainLayout: 'blankLayout',
		mainLayoutEl: null,
		popupLayout: 'mainPopup',
		defaultALDPath: '/ald/AMP.ald',
		currentALDId: '',
		moduleWait: {}, //모듈 동기화 임시변수
		dialogList: [], //다이얼로그 리스트
		dialogMap: {}, //다이얼로그 맵
		moduleLayoutMap: {}, //모듈별 레이아웃 맵
		pageParam: [],
		common_module: [], //미리 불러올 모듈 리스트
		param: [],
		js_base: '/view',
		scriptList: [], //현재 로드된 전체 스크립트 목록
		cssList: [], //로드된 css 리스트(중복방지용)
		vueMethod: {},
		timeOutSeconds: 5,
		moduleVersion: null,
	},
	/**
	 * AMP 초기화
	 * @param {*} args extv 객체에 추가 or 교체 할 파라미터
	 * @param {*} init_event init 수행 후의 콜백함수
	 */
	init: function (args, init_event) {
		var obj = this

		// window.pageback = obj.defaultBack;
		obj.setGlobalFunctions()

		this.extv = Object.assign(this.extv, args)

		//기본 레이아웃 로드
		this.loadAmpLayoutDatas(
			[AMP.extv.defaultALDPath],
			function () {
				obj.initAMPParam()
				//페이지 디폴트 변수 로드
				var am = obj.currentAM()
				obj.run(am)
				obj.extv.mainLayoutEl = document.getElementById(obj.extv.mainLayout)
				// 콜백함수가 있는 경우 호출
				if (typeof init_event === 'function') init_event()
			},
			{},
		)
		if (obj.hashVersion) {
			window.onhashchange = function (event) {
				console.log('window.onhashchange')
				obj.move(obj.currentAM())
				obj.hideLoading()
				event.preventDefault()
			}
		}
	},
	destory: function () {},
	/** 현재 노출중인 페이지 모듈명 반환 */
	currentAM: function () {
		if (this.hashVersion) {
			return location.hash.split('?')[0].replace('#', '') || this.extv.defaultModule
		} else {
			return this._GET('am') || this.extv.defaultModule
		}
	},
	/** 현재 노출중인 페이지 모듈 객체 반환 */
	currentPage: function () {
		if (this.f[this.currentAM()] === undefined) {
			console.error('AMP : 현재 페이지가 없습니다.')
			return undefined
		}
		return this.f[this.currentAM()]
	},
	loadAmpLayoutDatas: function (mList, e) {
		var obj = this
		var eList = {}
		var str = 'obj.eventChain('
		for (var i = 0; i < mList.length; i++) {
			//eList[i].idx = i;
			str += 'function(end){'
			str += ' obj.loadAmpLayoutData(mList[' + i + '], function() {end()});'
			str += ' }, '
		}
		str += ' e)'
		eval(str)
	},
	/** AMP layout data를 로드 */
	loadAmpLayoutData: function (path, event, defValue, opt) {
		var obj = this

		if (typeof opt === 'undefined') opt = {}
		opt.adjustPreExt = false
		var saveValue = obj.extv.extData
		if (typeof opt.returnValue !== 'undefined' && opt.returnValue) saveValue = {}

		obj.readFile(
			path,
			function (data) {
				//파싱
				var arr = data.split('\n')
				var html = ''
				var fName = 'temp'
				var isSkip = true
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].indexOf('#START') != -1) {
						html = ''
						var tarr = arr[i].split(' ')
						var fName = tarr[tarr.length - 1].trim()
						saveValue[fName] = ''
						isSkip = false
					} else if (arr[i].indexOf('#END') != -1) {
						isSkip = true
					} else {
						if (!isSkip) {
							saveValue[fName] += arr[i] + '\n'
						}
					}
				}

				if (event != undefined) event(saveValue)
			},
			defValue,
			opt,
		)
	},
	/** API와 통신 (통합버전) : 기본값 POST */
	Api: function (param) {
		var obj = this
		param = Object.assign({ url: '', methods: 'POST', data: {} }, param)
		var xhr = new XMLHttpRequest()
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					var d = obj.parseJSON(xhr.responseText)
					console.log('%s%c%s%c', `[${dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')}]`, 'color:green', ` Api response ${param.url}`, 'color:black', d)
					if (typeof d.newUserToken == 'object' && d.newUserToken.token && d.newUserToken.refreshToken) {
						AMP.setStorage('userInfo', AMP.parseJwt(d.newUserToken.token))
						AMP.setStorage('userToken', d.newUserToken)
					}
					if (typeof d.newDeviceToken == 'object' && d.newDeviceToken.token && d.newDeviceToken.refreshToken) {
						AMP.setStorage('deviceToken', d.newDeviceToken)
					}
					param.success(d)
				} else {
					if (typeof param.failed === 'function') {
						var d = obj.parseJSON(xhr.responseText || '{}')
						param.failed(d)
					}
				}
			}
		}
		var finalUrl = param.url
		// if (param.methods == 'GET') {
		//     finalUrl += AMP.jsonToParamString(param.data)
		// }
		xhr.open(param.methods, finalUrl)
		xhr.timeout = obj.timeOutSeconds * 1000
		if (!(param.data instanceof FormData)) {
			xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
		}
		if (typeof param.headers == 'object') {
			for (i in param.headers) {
				xhr.setRequestHeader(i, param.headers[i])
			}
		}
		console.log('%s%c%s%c', `[${dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')}]`, 'color:blue', ` Api request ${param.url}`, 'color:black', param.data)
		if (Object.keys(param.data).length == 0) {
			xhr.send('{}')
		} else if (param.data instanceof FormData) {
			xhr.send(param.data)
		} else if (param.data) {
			if (param.data instanceof Object) {
				xhr.send(JSON.stringify(param.data))
			} else {
				xhr.send(param.data)
			}
		}
	},
	ApiSync: function (param) {
		return new Promise(function (resolve, reject) {
			let obj = this
			param = Object.assign({ url: '', methods: 'POST', data: {} }, param)
			let httpRequest = new XMLHttpRequest()
			httpRequest.onreadystatechange = function () {
				if (httpRequest.readyState === XMLHttpRequest.DONE) {
					if (httpRequest.status === 200) {
						var d = AMP.parseJSON(httpRequest.responseText)
						console.log('%s%c%s%c', '[' + dayjs().format('YYYY-MM-DD HH:mm:ss:SSS') + ']', 'color:green', 'Api response ' + param.url, 'color:black', d)
						if (typeof d.newUserToken == 'object' && d.newUserToken.token && d.newUserToken.refreshToken) {
							AMP.setStorage('userInfo', AMP.parseJwt(d.newUserToken.token))
							AMP.setStorage('userToken', d.newUserToken)
						}
						if (typeof d.newDeviceToken == 'object' && d.newDeviceToken.token && d.newDeviceToken.refreshToken) {
							AMP.setStorage('deviceToken', d.newDeviceToken)
						}
						resolve(d)
					} else {
						if (typeof param.failed === 'function') {
							var r = AMP.parseJSON(httpRequest.responseText || '{}')
							reject(r)
						}
					}
				}
			}
			let finalUrl = param.url
			if (param.methods === 'GET') {
				finalUrl += AMP.jsonToParamString(param.data)
			}
			httpRequest.open(param.methods, finalUrl)
			httpRequest.timeout = obj.timeOutSeconds * 1000
			if (!(param.data instanceof FormData)) {
				httpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8')
			}
			if (typeof param.headers == 'object') {
				for (i in param.headers) {
					httpRequest.setRequestHeader(i, param.headers[i])
				}
			}

			console.log('%s%c%s%c', '[' + dayjs().format('YYYY-MM-DD HH:mm:ss:SSS') + ']', 'color:blue', 'Api request ' + param.url, 'color:black', param.data)
			if (Object.keys(param.data).length == 0) {
				httpRequest.send('{}')
			} else if (param.data instanceof FormData) {
				httpRequest.send(param.data)
			} else if (param.data) {
				if (param.data instanceof Object) {
					httpRequest.send(JSON.stringify(param.data))
				} else {
					httpRequest.send(param.data)
				}
			}
		})
	},
	apiFileDownload: function (param) {
		var obj = this
		var xhr = new XMLHttpRequest()

		xhr.open('POST', param.url)
		xhr.timeout = obj.timeOutSeconds * 1000
		xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
		xhr.setRequestHeader('X-AUTH-TOKEN', localStorage.getItem('X-AUTH-TOKEN'))
		xhr.responseType = 'blob'
		if (Array.isArray(param.headers)) {
			param.headers.forEach((e) => {
				xhr.setRequestHeader(e.key, e.data)
			})
		}
		xhr.onload = function () {
			if (this.status === 200) {
				// Refused to get unsafe header "Content-Disposition" 에러 발생하여 주석처리함
				// var disposition = xhr.getResponseHeader('Content-Disposition');
				// console.log('disposition:', disposition);
				// if (disposition && disposition.indexOf('attachment') !== -1) {
				//     var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				//     var matches = filenameRegex.exec(disposition);
				//     if (matches != null && matches[1]) param.fileName = matches[1].replace(/['"]/g, '');
				// }
				var type = xhr.getResponseHeader('Content-Type')

				var blob = new Blob([this.response], { type: type })
				if (typeof window.navigator.msSaveBlob !== 'undefined') {
					// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
					window.navigator.msSaveBlob(blob, param.fileName)
				} else {
					var URL = window.URL || window.webkitURL
					var downloadUrl = URL.createObjectURL(blob)

					if (param.fileName) {
						// use HTML5 a[download] attribute to specify fileName
						var a = document.createElement('a')
						// safari doesn't support this yet
						if (typeof a.download === 'undefined') {
							window.location = downloadUrl
						} else {
							a.href = downloadUrl
							a.download = param.fileName
							document.body.appendChild(a)
							a.click()
						}
					} else {
						window.location = downloadUrl
					}
					setTimeout(function () {
						URL.revokeObjectURL(downloadUrl)
						AMP.hideLoading()
					}, 100) // cleanup
				}
				console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')}] apiFileDownload response ${param.url}`)
			}
		}
		console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')}] apiFileDownload request ${param.url}`, param.data)
		xhr.send(JSON.stringify(param.data))
	},
	fileDownload: function (url) {
		var browserName = undefined
		var userAgent = navigator.userAgent

		switch (true) {
			case /Trident|MSIE/.test(userAgent):
				browserName = 'ie'
				break

			case /Edge/.test(userAgent):
				browserName = 'edge'
				break

			case /Chrome/.test(userAgent):
				browserName = 'chrome'
				break

			case /Safari/.test(userAgent):
				browserName = 'safari'
				break

			case /Firefox/.test(userAgent):
				browserName = 'firefox'
				break

			case /Opera/.test(userAgent):
				browserName = 'opera'
				break

			default:
				browserName = 'unknown'
		}

		//ie 브라우저 및 EDGE 브라우저
		if (browserName == 'ie' || browserName == 'edge') {
			//ie11
			var _window = window.open(url, '_blank')
			_window.document.close()
			_window.document.execCommand('SaveAs', true, 'file.hwp' || url)
			_window.close()
		} else {
			//chrome
			var filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0]
			var xhr = new XMLHttpRequest()
			xhr.responseType = 'blob'
			xhr.onload = function () {
				var a = document.createElement('a')
				a.href = window.URL.createObjectURL(xhr.response) // xhr.response is a blob
				a.download = filename // Set the file name.
				a.style.display = 'none'
				document.body.appendChild(a)
				a.click()
				delete a
			}
			xhr.open('GET', url)
			xhr.send()
		}
	},

	//{{}}구문치환
	replaceValue: function (data, objMap, objMap2) {
		for (var prop in objMap) {
			if (objMap.hasOwnProperty(prop)) {
				data = data.replace(new RegExp('{{' + prop + '}}', 'g'), objMap[prop])
			}
		}

		if (typeof objMap2 !== 'undefined') {
			console.log(objMap2)
			for (var prop in objMap2) {
				if (objMap2.hasOwnProperty(prop)) {
					data = data.replace(new RegExp('{{' + prop + '}}', 'g'), objMap2[prop])
				}
			}
		}

		return data
	},

	//맵치환을 적용
	readFileWithMap: function (file, event, objMap) {
		var obj = this
		obj.readFile(file, function (data) {
			for (var prop in objMap) {
				if (objMap.hasOwnProperty(prop)) {
					data = data.replace(new RegExp('{{' + prop + '}}', 'g'), objMap[prop])
				}
			}
			event(data)
		})
	},

	/** 로컬파일 읽기 */
	readFile: function (file, event) {
		var obj = this
		var rawFile = new XMLHttpRequest()
		rawFile.open('GET', file + (obj.extv.moduleVersion == null ? '' : '?mv=' + obj.extv.moduleVersion), false)
		rawFile.onreadystatechange = function () {
			// rawFile.onload = function() {
			if (rawFile.readyState === XMLHttpRequest.DONE) {
				if (rawFile.status === 200 || rawFile.status == 0) {
					//읽기 성공
					var allText = rawFile.responseText
					event(allText)
				} else if (rawFile.status == 404) {
					event(null)
				}
			} else {
				//읽기 실패
				// alert(file + " 로드 오류");
				//에러시 이동
				// obj.urlOpen(obj.extv.errorPage, {});
				event(null)
			}
		}
		rawFile.send(null)
	},
	urlOpenNew: function (url, values, callback) {
		this.urlOpen(url, values, callback, true)
	},
	urlOpen: function (url, values, callback, isNew) {
		if (typeof isNew === 'undefined') isNew = false

		var addString = ''
		var keys = Object.keys(values)
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] == 'am' || keys[i] == 'Lang') continue
			addString += '&' + keys[i] + '=' + values[keys[i]]
		}
		//마지막 스트링 & 삭제
		if (addString.length >= 2) {
			addString = addString.substring(0, addString.length - 1)
		}

		if (!isNew) location.href = url + addString
		else window.open(url + addString)

		if (typeof callback === 'function') callback()
	},
	/** 화면 이동 */
	move: function (moduleName, values) {
		var obj = this
		// loading 제어를 각 화면에서 제어하도록 주석처리
		// obj.showLoading();
		if (obj.hashVersion) {
			/**
			 * move hash 방식으로 module 이동 하는 방식
			 * GET파라미터로 처리하면 페이지 reload가 일어나서 js 모듈이 모두 재로드 되지만,
			 * SPA 방식으로 move만으로 이동하게 되면 adminlte 등 일부 라이브러리가 DOM객체가 그려지기 전에 수행되어 기능이 정상동작하지 못함
			 */
			obj.run(moduleName, {
				value: values,
				callback: function () {
					// obj.hideLoading();
					obj.setLocation(moduleName, values)
				},
			})
		} else {
			obj.executeModule(moduleName, values, false)
		}
	},
	/**
	 * Url 주소를 현재 이동한 화면에 맞게 구성
	 * @param {*} moduleName 모듈명
	 * @param {*} values 화면에 유지할 Get파라미터
	 */
	setLocation: function (moduleName, values) {
		if (typeof values !== 'object') values = {}

		var addString = ''
		for (var key in values) {
			addString += '&' + key + '=' + encodeURIComponent(values[key])
		}
		if (addString.length > 0) {
			addString = addString.replace('&', '?') // 맨앞의 & 는 ?로 변환
		}
		location.href = location.protocol + '//' + location.host + '#' + moduleName + addString
	},
	/** URL주소 변경을 통해 화면 이동 */
	executeModule: function (moduleName, values, isNew) {
		var obj = this
		var linkName = ''
		//로컬 변수 넘어가는 구조 추가 필요

		if (typeof values == 'undefined') values = {}

		var addString = ''
		var keys = Object.keys(values)
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] == 'am' || keys[i] == 'Lang') continue
			if (keys[i] == 'plink') {
				linkName = values[keys[i]]
				continue
			}
			if (keys[i] == '') {
				continue
			}
			if (typeof values[keys[i]] === 'undefined') values[keys[i]] = ''
			addString += '&' + keys[i] + '=' + encodeURIComponent(values[keys[i]])
		}
		if (!isNew) {
			if (AMP.currentAM != 'member/login') {
				location.href = linkName + '?am=' + moduleName + addString
			} else {
				location.replace(linkName + '?am=' + moduleName + addString)
			}
		} else {
			window.open(linkName + '?am=' + moduleName + addString)
		}
	},
	/** 파일스트링으로 부터 AMP_COMMON_MODULE의 목록을 검색 */
	parseAmCommonModuleName: function (data) {
		var obj = this
		var rs = {}
		var scriptList = []
		//파싱
		var arr = data.split('\n')
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].indexOf('AMP_COMMON_MODULE') != -1) {
				// console.log(arr[i]);
				var found = arr[i].match(/\[(.*?)\]/)[1].replace(/['\" ]/gi, '')
				// console.log(found);
				var sca = found.split(',')
				for (var j = 0; j < sca.length; j++) {
					// console.log("found: " + sca[j]);
					//이미 로드된 스크립트는 스킵
					var moduleAndPath = obj.splitModule(sca[j])
					// console.log(moduleAndPath.moduleName);
					if (typeof window[moduleAndPath.moduleName] !== 'undefined' && window[moduleAndPath.moduleName].NO_LAYOUT == 1) continue
					// 이미 로드할 scriptList에 포함되어 있는지 체크 & 스크립트명이 0글자는 무시
					if (scriptList.indexOf(sca[j]) == -1 && sca[j].length > 0) {
						scriptList.push(sca[j])
					}
				}
			} else if (arr[i].indexOf('AMP_LAYOUT_ID') != -1) {
				// 홀따옴표 쌍따옴표 둘다 사용 가능하도록 변경
				var currentAmpLayoutId = arr[i].match(/['"](.*?)['"]/)[1].replace(/["' ]/, '')
				rs.currentAmpLayoutId = currentAmpLayoutId
			}
		}

		rs.scriptList = scriptList
		return rs
	},
	/** AM의 텍스트 파일을 읽음 */
	readAMFile: function (am, event) {
		var obj = this
		var m = obj.splitModule(am)
		var path = obj.extv.js_base + m.path + '/' + m.moduleName + '.js'
		obj.readFile(path, function (data) {
			event(data)
		})
	},
	/** 하나의 파일에서 생성된 스크립트 리스트 참색 */
	findOneIncludeFile: function (am, event) {
		var obj = this

		var m = obj.splitModule(am)
		var fname = obj.extv.js_base + m.path + '/' + m.moduleName + '.js'

		if (typeof obj.extv.tempScriptList !== 'object') obj.extv.tempScriptList = []
		if (typeof obj.extv.totalScriptList !== 'object') obj.extv.totalScriptList = []

		if (am == '') {
			if (typeof event === 'function') event()
			return
		}
		obj.readFile(fname, function (data) {
			var mrs = obj.parseAmCommonModuleName(data)
			var scriptList = mrs.scriptList
			obj.extv.tempScriptList = scriptList.slice() //전체리스트에 추가
			var ampLayoutId = mrs.currentAmpLayoutId //메인스크립트의 파일을 기준오로 공유(인크루드의 경우);
			obj.extv.moduleLayoutMap[am] = ampLayoutId
			// obj.appendArrayUnique(obj.extv.totalScriptList, scriptList.slice());
			// ES6를 써도 될 경우 아래 코드로 배열 합치기 가능
			// obj.extv.totalScriptList = [...new Set([...obj.extv.totalScriptList, ...scriptList])];
			// ES6 ... 구문 제거
			obj.extv.totalScriptList = Array.from(new Set(Object.assign(obj.extv.totalScriptList, scriptList)))
			if (typeof event === 'function') event()
		})
	},
	/**
	 * AM 모듈의 include는 2depth까지만 지원함
	 * @param {*} am
	 * @param {*} event
	 */
	checkIncludeFiles: function (am, event) {
		var obj = this

		obj.extv.totalScriptList = []
		obj.extv.tempScriptList = []

		obj.findOneIncludeFile(am, function () {
			//속도이슈로 인해 탐색을 1depth로 제한
			obj.loopWorks('findOneIncludeFile', obj.extv.tempScriptList, function () {
				obj.extv.totalScriptList.push(am)
				event(obj.extv.totalScriptList, obj.extv.moduleLayoutMap[am])
			})
		})
	},
	appendArray: function (s, t) {
		for (var i = 0; i < t.length; i++) {
			s.push(t[i])
		}
		return s
	},
	appendArrayUnique: function (s, t) {
		for (var i = 0; i < t.length; i++) {
			if (s.indexOf(t[i]) == -1) {
				s.push(t[i])
			}
		}
		return s
	},
	/** AM의 이름을 path와 모듈이름으로 구분 */
	splitModule: function (_moduleName) {
		var obj = this
		var moduleName = _moduleName.replace('.', '/')
		var path = ''
		var ar = moduleName.split('/')
		for (var i = 0; i < ar.length - 1; i++) {
			path += '/' + ar[i]
		}
		if (ar[ar.length - 1].indexOf('^') > -1) {
			moduleName = ar[ar.length - 1].substring(0, ar[ar.length - 1].indexOf('^'))
		} else {
			moduleName = ar[ar.length - 1]
		}
		return { moduleName: moduleName, path: path }
	},
	//수동으로 로컬 파람 추가
	putPageParams: function (map) {
		var obj = this
		var keys = Objects.keys(map)
		for (var i = 0; i < keys.length; i++) {
			// obj.extv.pageParam[keys[i]] = map[keys[i]];
			obj.putPageParam(keys[i], map[keys[i]])
		}
	},
	putPageParam: function (key, value) {
		var obj = this
		obj.extv.pageParam[key] = value
		console.log('putPageParam', obj.extv.pageParam)
	},
	_GET: function (varName) {
		var obj = this

		if (obj.extv.pageParam != null && typeof obj.extv.pageParam[varName] != 'undefined') return obj.extv.pageParam[varName]

		if (typeof obj.extv.param[varName] != 'undefined') return obj.extv.param[varName]
		else return ''
	},
	/** get, post 변수 기본값 세팅 */
	initAMPParam: function () {
		this.extv.param = this.localParamToJSON()
	},
	localParamToJSON: function () {
		var obj = this
		var queryStr = window.location.search
		return obj.paramToJSON(queryStr)
	},
	getLocalParam: function () {
		var queryStr = window.location.search + '&'
		return queryStr
	},
	jsonToParamString: function (json) {
		var rstr = ''
		var r1 = AMP.mapToArr(json)
		for (var i = 0; i < r1.length; i++) {
			if (rstr.length == 0) {
				rstr += '?' + r1[i].key + '=' + r1[i].value
			} else {
				rstr += '&' + r1[i].key + '=' + r1[i].value
			}
		}
		return rstr
	},
	loopWorks: function (fname, mList, e) {
		var obj = this
		var str = 'obj.eventChain('
		for (var i = 0; i < mList.length; i++) {
			str += 'function(end){'
			str += ' obj.' + fname + '(mList[' + i + '], function() {end()});'
			str += '}, '
		}
		str += ' e)'
		eval(str)
	},
	loadScripts: function (mList, e) {
		var obj = this
		var str = 'obj.eventChain('
		for (var i = 0; i < mList.length; i++) {
			str += 'function(end){'
			str += ' obj.loadScript(mList[' + i + '], function() {end()});'
			str += '}, '
		}
		str += ' e)'
		eval(str)
	},
	loadScript: function (url, callback, opt) {
		//중복방지 코드 필요함
		var obj = this
		var script = document.createElement('script')
		script.type = 'text/javascript'

		if (typeof opt !== 'object') opt = {}

		if (script.readyState) {
			//IE
			script.onreadystatechange = function () {
				if (script.readyState == 'loaded' || script.readyState == 'complete') {
					script.onreadystatechange = null
					if (typeof callback === 'function') {
						callback()
					}
				}
			}
		} else {
			//Others
			script.onload = function () {
				if (typeof callback === 'function') {
					callback()
				}
			}
		}
		if (typeof opt.noDst !== 'undefined' && opt.noDst) script.src = url
		else script.src = url + (obj.extv.moduleVersion == null ? '' : '?mv=' + obj.extv.moduleVersion)
		document.getElementsByTagName('head')[0].appendChild(script)
	},
	loadJsCssFiles: function (mList, e) {
		var obj = this
		var str = 'obj.eventChain('
		for (var i = 0; i < mList.length; i++) {
			var f = mList[i]
			var fext = obj.checkFileExtension(f)
			if (fext == 'js') {
				str += 'function(end){'
				str += ' obj.loadScript(mList[' + i + '], function() {end()});'
				str += '}, '
			} else if (fext == 'css') {
				str += 'function(end){'
				str += ' obj.loadCSS(mList[' + i + '],  function() {end()});'
				str += '}, '
			}
		}
		str += ' e)'
		eval(str)
	},
	loadCSS: function (url, callback) {
		var obj = this
		var headID = document.getElementsByTagName('head')[0]
		console.log('loadCSS url : ' + url)
		var cssNode = document.createElement('link')
		cssNode.type = 'text/css'
		cssNode.rel = 'stylesheet'
		cssNode.href = url + (obj.extv.moduleVersion == null ? '' : '?mv=' + obj.extv.moduleVersion)
		headID.appendChild(cssNode)
		if (typeof callback === 'function') {
			setTimeout(function () {
				callback()
			}, 100)
		}
	},
	/** 페이지 모듈을 실행 */
	run: function (moduleName, args) {
		var obj = this
		obj.pageParam = args

		console.log('AMP run : ' + moduleName)
		obj.checkIncludeFiles(moduleName, function (scriptList, ampLayoutId) {
			// console.log(scriptList);
			var slist = []
			var pa = obj.extv.common_module
			for (var i = 0; i < pa.length; i++) {
				// if(typeof obj.f[pa[i]] === 'undefined')
				slist.push(pa[i])
			}

			for (var i = 0; i < scriptList.length; i++) {
				// if(typeof obj.f[scriptList[i]] === 'undefined')
				slist.push(scriptList[i])
			}

			if (slist.indexOf(moduleName) == -1) {
				slist.push(moduleName)
			}

			obj.extv.scriptList = scriptList //AMP에 스크립트 목록 등록
			obj.extv.ampLayoutId = ampLayoutId
			// console.log(obj.extv.scriptList);
			// console.log(slist);
			obj.runMultiModule(slist, args, arguments, function () {
				console.log('AM 로딩 완료 => 모듈명 : ' + moduleName)
				if (typeof args === 'object') {
					if (typeof args.callback === 'function') {
						args.callback()
					}
				}
			})
		})
	},
	runMultiModule: function (mList, args, totalArguments, event) {
		var obj = this
		if (args === undefined) args = {}
		var str = 'obj.eventChain('
		for (var i = 0; i < mList.length; i++) {
			if (mList[i] == '') continue
			str += 'function(end){'
			str += " obj.runModule('" + mList[i] + "', args, totalArguments, function() {end()} );"
			str += ' }, '
		}
		str += ' event)'
		eval(str)
	},
	/** 모듈 실행 */
	runModule: function (_moduleName, _args, totalArguments, callback) {
		var obj = this

		if (typeof _args === 'undefined') _args = {}

		var moduleAndPath = this.splitModule(_moduleName)

		//임포트할 스크립트를 미리 확인해서 로드
		var moduleName = moduleAndPath.moduleName
		var modulePath = moduleAndPath.path

		obj.loadScript(obj.extv.js_base + modulePath + '/' + moduleName + '.js', function () {
			obj.f[_moduleName] = obj.module
			window[moduleName] = obj.module // 같은 이름일 경우 마지막 내용 적용

			//현재 디폴트 레이아웃이 비어있거나 기존과 틀리면 레이아웃 교체
			var layoutAldId = obj.f[_moduleName].AMP_LAYOUT_ID
			// alert(obj.extv.ampLayoutId + "," + layoutAldId);
			//하나의 모듈에서 여러개의 파일을 인클루드할 때 일클루드 파일은 메인파일의 레이아웃 아이디를 따라감
			if (obj.extv.ampLayoutId != '') layoutAldId = obj.extv.ampLayoutId

			//팝업일경우 layout을 변경하지 않음
			if (obj.f[_moduleName].IS_POPUP) layoutAldId = ''

			// console.log("[레이아웃 아이디] " + layoutAldId + " // " + obj.extv.ampLayoutId);
			// alert(obj.extv.js_base + modulePath + "/" + moduleName + ".js" +" // " +layoutAldId);
			AMP.makeDefaultLayout(layoutAldId, function () {
				AMP.runModuleAttachLayout(_moduleName, _args, totalArguments, function () {
					callback()
				})
			})
		}) //load script
	},
	/** 타겟 레이아웃 태그에 기본 레이아웃을 구성한다 */
	makeDefaultLayout: function (layoutAldId, event) {
		var obj = this
		if (typeof layoutAldId === 'undefined' || layoutAldId == '') {
			event()
			return
		}
		//레이아웃이 없거나 기존과 다를 경우 교체
		if (this.extv.currentALDId != layoutAldId) {
			console.log('[레이아웃 교체 ] ' + this.extv.currentALDId + ' -> ' + layoutAldId, obj.extv.mainLayout)
			this.extv.currentALDId = layoutAldId
			var ald1 = this.extv.extData[layoutAldId]
			// document틀 통해 메인에 붙임
			document.getElementById(obj.extv.mainLayout).innerHTML = ald1
			event()
		} else {
			event()
		}
	},
	/** AMP 모듈 실행후 레이아웃 붙이기 */
	runModuleAttachLayout: function (_moduleName, _args, totalArguments, callback) {
		var obj = this

		var moduleAndPath = this.splitModule(_moduleName)

		var moduleName = moduleAndPath.moduleName
		var modulePath = moduleAndPath.path

		var args = {}
		if (typeof _args != 'undefined') args = _args

		obj.f[_moduleName].mname = moduleName
		obj.f[_moduleName].moduleName = _moduleName
		obj.f[_moduleName].args = args
		obj.f[_moduleName].totalArguments = totalArguments

		//백버튼 매핑
		// if (typeof obj.f[_moduleName].back !== 'undefined') {
		//     window.pageback = obj.f[_moduleName].back;
		// } else {
		//     obj.f[_moduleName].back = obj.defaultBack;
		//     window.pageback = obj.f[_moduleName].back;
		// }

		//단순 레이아웃 없는 스크립트의 경우
		if (typeof obj.f[_moduleName].NO_LAYOUT != 'undefined' && obj.f[_moduleName].NO_LAYOUT) {
			if (typeof _args === 'object' && typeof _args.end === 'function') {
				_args.end()
			}
			callback()
		} else {
			var is_popup = obj.f[_moduleName].IS_POPUP || false

			//if (typeof obj.f[_moduleName].NO_LAYOUT == "undefined" || obj.f[_moduleName].NO_LAYOUT != 1){
			//CSS 로드
			//            obj.loadCSS(obj.extv.js_base + modulePath + "/" + moduleName + ".css", function(){

			//이미 css가 로드 된 경우 재적용하지 않는다면, 굳이 readFile을 수행하여 파일 읽기를 할 필요도 없으므로 readFile자체를 안하면 성능 향상 가능
			//css가 한번 로드되었을 경우 적용하지 않음
			// AMP_LOAD_CSS 변수가 true인 경우에만 css파일을 읽음 xelloss
			if (obj.extv.cssList.indexOf(_moduleName) == -1 && (false || obj.f[_moduleName].AMP_LOAD_CSS)) {
				//화면을 빠르게 로드하기 위해서는 해당 코드를 상위로 빼야하 cgkim
				var cssFile = obj.extv.js_base + modulePath + '/' + moduleName + '.css'
				obj.readFile(cssFile, function (cssData) {
					var style = document.createElement('style')
					// 2020.10.20 : Style 내부에 줄바꿈마다 <br> 붙는 현상 수정
					// style.innerText = cssData;
					style.innerHTML = cssData
					// 2020.10.20 : Style 내부에 줄바꿈마다 <br> 붙는 현상 수정 END
					style.setAttribute('AMP_CSS', modulePath + '/' + moduleName)
					document.head.appendChild(style)
					obj.extv.cssList.push(_moduleName)
					// obj.f[_moduleName].cssData = ""; //cssData;

					// css 적용 후 layout 적용
					setLayout()
				})
			} else {
				// 이미 css로드 된 경우 바로 layout 적용
				setLayout()
			}

			function setLayout() {
				//레이아웃 붙임
				var targetId = obj.f[_moduleName].AMP_TARGET_ID || 'AMP_CONTENT'

				obj.attachLayout(_moduleName, targetId, moduleName, obj.extv.js_base + modulePath + '/' + obj.f[_moduleName].mname + '.html', is_popup, _args ? _args.isTab : false, function (vue) {
					// 로직실행
					// run함수가 있을 때만 수행하도록 변경 2020-11-20
					if (typeof obj.f[_moduleName].run === 'function') {
						obj.f[_moduleName].run(args, vue, totalArguments)
					}

					// AMP.hideLoading();
					if (typeof _args === 'object' && typeof _args.end === 'function') {
						_args.end()
					}
					callback()
				})
			}
		}
	},
	/** 컨트롤별 레이아웃을 붙임 */
	attachLayout: function (moduleName, id, moduleNameOnly, path, is_popup, is_tab, event) {
		var obj = this

		if (obj.f[moduleName] && obj.f[moduleName].AMP_COMMON_HTML != null) {
			this.readFile(obj.f[moduleName].AMP_COMMON_HTML, processHtml)
		} else {
			this.readFile(path, processHtml)
		}
		function processHtml(data) {
			var vueId = id

			//뷰id와 targetId가 다를 경우 선언
			if (typeof obj.f[moduleName].AMP_VUE_TARGETID !== 'undefined') vueId = obj.f[moduleName].AMP_VUE_TARGETID

			var vdata = {}
			var marr = data.match(/\{\{[\sa-zA-Z0-9\_]+\}\}/gi)

			if (marr != null) {
				for (var i = 0; i < marr.length; i++) {
					var str = marr[i].substring(2, marr[i].length - 2).replaceAll(' ', '')

					vdata[str] = ''
				}
			}
			marr = data.match(/[\s\"\']amp_[\w]+[\s\"\']/gi)
			if (marr != null) {
				for (var i = 0; i < marr.length; i++) {
					var str = marr[i].replaceAll(' ', '').replaceAll('"', '').replaceAll("'", '')
					vdata[str] = ''
				}
			}
			// replace하기 위해 소문자만 지원
			var findAld = /<ald>.*?<\/ald>/
			aldPosition = findAld.exec(data)
			while (aldPosition != null) {
				// 동일 명칭의 ald가 있으면 교체
				var aldName = aldPosition[0]
				aldName = aldName.substring(5, aldName.length - 6)

				if (obj.extv.extData[aldName]) {
					data = data.replaceAll('<ald>' + aldName + '</ald>', obj.extv.extData[aldName])
					aldPosition = findAld.exec(data)
				} else {
					console.error('ald 교체 시도했으나, ald파일에 없음')
					break
				}
			}

			//페이지 추가 변수
			if (typeof obj.f[moduleName].AMP_VALUES !== 'undefined') {
				var r1 = AMP.mapToArr(obj.f[moduleName].AMP_VALUES)
				for (var i = 0; i < r1.length; i++) {
					vdata[r1[i].key] = r1[i].value
				}
			}
			//뷰 메서드 추가
			var methods = {}
			var vueParam = {}

			if (is_popup) {
				//이미 다이얼로그 아이디가 있는 경우 오류임, 스크립트가 다시 로드되면 해당 값이 리셋되면서 레이아웃이 꼬임 %%
				if (typeof obj.f[moduleName].dlg_id !== 'undefined') {
					alert('에러 : ' + moduleName + ' 명의 다이얼로그가 2회이상 호출되었습니다.')
					return
				}

				var dlg_id = 'AMPDLG_' + obj.randomString(6, 6)
				obj.f[moduleName].dlg_id = dlg_id

				//patterSearch2
				var dlayout = AMP.patterSearch2(AMP.extv.extData['POPUP_BASE'], {
					dlg_id: dlg_id,
					content: data,
				})
				//팝업의 경우 팝업레이아웃에 부착
				document.getElementById(obj.extv.popupLayout).insertAdjacentHTML('beforeend', dlayout)
				id = dlg_id
				vueId = dlg_id
			} else if (is_tab) {
				var tabSplitIdx = moduleName.indexOf('^')
				if (tabSplitIdx > -1) {
					id = id + moduleName.substring(tabSplitIdx + 1)
					vueId = id
				}
				if (document.getElementById(id) == null) {
					console.error('[해당 레이어아이디가 화면에 없습니다. *.ald파일을 확인해주세요] => id:' + id)
				} else {
					// 해당 레이아웃의 하위에 추가하는 버전
					// var newTab = document.createElement("div");
					// newTab.innerHTML = data;
					// document.getElementById(id).appendChild(newTab);

					// 해당 레이아웃에 덮어쓰는 버전
					document.getElementById(id).innerHTML = data
				}
			} else {
				if (document.getElementById(id) == null) {
					console.log('[해당 레이어아이디가 화면에 없습니다. *.ald파일을 확인해주세요] => id:' + id)
				} else {
					document.getElementById(id).innerHTML = data
				}
			}

			//전역 뷰 메서드 등록
			var mkeys = Object.keys(obj.extv.vueMethod)
			for (var i = 0; i < mkeys.length; i++) {
				var key = mkeys[i]
				var value = obj.extv.vueMethod[key]
				var type = typeof obj.extv.vueMethod[key]
				if (key == 'computed') {
					vueParam.computed = value
				} else if (type == 'function') methods[key] = value
				else vdata[key] = value
			}

			obj.makeVueMethod(moduleName, methods, vdata, vueParam)

			//AMP 프로세스가 크게 변경되었으므로 향후 내용 추적이 필요함.
			var vue = obj.createVue(vueId, vdata, methods, vueParam)
			obj.f[moduleName] = vue
			obj.f[moduleName].vue = vue //호환성을 위한 코드, 메뉴 객체는 이제 뷰객체 기반에서 동작함

			/* 전역으로 사용할 함수 세팅 : 같은 기능의 경우 현재 am기준으로 세팅 */
			console.log(obj.currentAM() + ' =============== ' + moduleName)
			if (obj.currentAM() == moduleName) {
				var source = obj.f[moduleName]

				var keys = Object.keys(obj.f)
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i]
					var value = obj.f[key]
					if (key == moduleName) continue
					if (value == null || typeof value == 'undefined' || value.NO_LAYOUT != null) continue
					// console.log(key + " ::: " + moduleName);
					// console.log("source:" + moduleName);
					// console.log("value:" + key);
					// console.log(source.back);
					value.back = source.back
					if (typeof value.$forceUpdate === 'function') {
						value.$forceUpdate()
					}
				}
			}
			vue.AMP = obj
			if (typeof event === 'function') {
				event(vue)
			}
		}
	},
	/** AM 에서 사용하는 전체 메소드를 뷰로 등록하는 파라메터 생성 */
	makeVueMethod: function (amoduleName, methods, vdata, vueParam) {
		var obj = this
		if (typeof vdata['_INIT_F'] === 'undefined') vdata['_INIT_F'] = {}

		//해피포인트, 해피기프트카드에서는 해당 코드가 필요함
		var fkey = Object.keys(obj.f)
		for (var k = 0; k < fkey.length; k++) {
			var moduleName = fkey[k]
			obj.f[amoduleName][moduleName] = obj.f[moduleName]
		}
		//vue 객체 연결
		var mkeys = Object.keys(obj.f[amoduleName])
		for (var i = 0; i < mkeys.length; i++) {
			var key = mkeys[i]
			var value = obj.f[amoduleName][key]
			var type = typeof obj.f[amoduleName][key]
			if (key == 'computed') {
				vueParam.computed = value
			} else if (key == 'updated' || key == 'mounted' || key == 'beforeCreate' || key == 'created' || key == 'beforeUpdate') {
				vueParam.updated = value
			} else if (type == 'function') methods[key] = value
			else {
				vdata[key] = value
			}
		}
	},
	/** Vue 객체 생성 */
	createVue: function (id, vdata, methods, vueParam) {
		var keys = Object.keys(this.extv.extDataPage)
		for (var i = 0; i < keys.length; i++) {
			//데이터에 셔션변수 입력, 어떤 흐름으로 입력할지 고민 필요
			vdata[keys[i]] = this.extv.extDataPage[keys[i]]
		}
		vdata.attrs = [
			{
				key: 'today',
				highlight: {
					backgroundColor: '#ff8080',
				},
				dates: new Date(2018, 0, 1),
			},
		]
		methods.dayjs = dayjs

		vdata.files = []
		methods.inputFile = function (newFile, oldFile) {
			if (newFile && oldFile && !newFile.active && oldFile.active) {
				console.log('response', newFile.response)
				if (newFile.xhr) {
					console.log('status', newFile.xhr.status)
				}
			}
		}

		/**
		 * Pretreatment
		 * @param  Object|undefined   newFile   Read and write
		 * @param  Object|undefined   oldFile   Read only
		 * @param  Function           prevent   Prevent changing
		 * @return undefined
		 */
		methods.inputFilter = function (newFile, oldFile, prevent) {
			if (newFile && !oldFile) {
				// Filter non-image file
				if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
					return prevent()
				}
			}

			// Create a blob field
			newFile.blob = ''
			var URL = window.URL || window.webkitURL
			if (URL && URL.createObjectURL) {
				newFile.blob = URL.createObjectURL(newFile.file)
			}
		}

		var components = {}

		if (typeof VueUploadComponent != 'undefined') components.FileUpload = VueUploadComponent

		if (typeof vuedraggable != 'undefined') components.draggable = vuedraggable

		var vObject = {
			el: '#' + id,
			components: components,
			data: function () {
				return vdata
			},
			methods: methods,
		}
		var nkey = Object.keys(vueParam)
		for (var i = 0; i < nkey.length; i++) {
			vObject[nkey[i]] = vueParam[nkey[i]]
		}

		var v = new Vue(vObject)

		this.extv.vueData[id] = v //뷰데이터 id별로 저장
		console.log('================== id:' + id)
		console.log(this.extv.vueData)

		return v
	},
	/** 해당 모듈의 화면을 강제로 업데이트 */
	forceUpdate: function (moduleName) {
		var obj = this
		if (typeof obj.f[moduleName] === 'undefined') {
			console.log('[모듈이 없습니다]' + moduleName)
			return
		}
		obj.f[moduleName].$forceUpdate()
	},
	/** 해당 모듈의 reload함수를 호출한다 : 사용되지 않음 */
	reload: function (moduleName, pjson) {
		var obj = this

		var reloadEvent = function () {
			var param = obj.localParamToJSON()

			var keys = Object.keys(pjson)

			for (var i = 0; i < keys.length; i++) {
				param[keys[i]] = pjson[keys[i]]
			}
			// var am = param["am"];
			obj.move(moduleName, param)
		}
		if (typeof obj.f[moduleName] === 'undefined') {
			// console.log("[모듈이 없습니다]" + moduleName);
			reloadEvent()
			return
		}
		if (typeof obj.f[moduleName].reload === 'undefined') {
			// console.log("[reload 함수가 없습니다]" + moduleName);
			reloadEvent()
			return
		}
		obj.f[moduleName].reload(pjson)
	},
	isLoadingProgress: function () {
		return document.getElementById('AMP_LOADING') != null
	},
	/** 화면 전체를 덮는 로딩 화면 */
	showLoading: function (percent) {
		// LOADING extData가 있을 때에만 동작
		if (document.getElementById('AMP_LOADING') == null && this.extv.extData['LOADING']) {
			document.body.insertAdjacentHTML('beforeend', this.extv.extData['LOADING'])
			var d = document.getElementById('AMP_LOADING')
			if (d != null) {
				d.addEventListener('touchmove', function (event) {
					event.preventDefault()
				})
			}
		}
		if (percent != null) {
			document.getElementById('AMP_LOADING_PERCENT').innerHTML = percent + '%'
		}
	},
	hideLoading: function () {
		var child = document.getElementById('AMP_LOADING')
		if (child != null) {
			document.getElementById('AMP_LOADING_PERCENT').innerHTML = ''
			child.parentNode.removeChild(child)
		}
	},
	/** 팝업 관련 함수들 jquery 사용때문에 외부로 빼는 부분 검토 */
	dialogSeq: 0,
	screenFix: function () {
		//this.scrollLock("mainPage");

		// var cPos = $(window).scrollTop()
		// $('#AMP_CONTENT').css('margin-top', -cPos)
		// window['AMPDialogScrollTop'] = cPos

		this.extv.mainLayoutEl.style.overflow = 'hidden'
		// mainLayout.style.position = 'fixed'

		// var checkTopTitle = $('.menu_bar_wrap')
		// if (!checkTopTitle.hasClass('top')) {
		// 	checkTopTitle.addClass('fixed')
		// }
	},
	screenRelease: function () {
		// $('#AMP_CONTENT').css('margin-top', '')

		this.extv.mainLayoutEl.style.overflow = ''
		// mainLayout.style.position = ''

		// $(window).scrollTop(window['AMPDialogScrollTop'])
		// $('.menu_bar_wrap').removeClass('fixed')
	},
	showDialog: function (moduleName, opt) {
		var obj = this

		if (obj.lockDialog) {
			return
		}
		// 이미 열려있는 팝업인 경우 먼저 닫아준다.
		// reload시키기 위함으로 추정됨..팝업의 init함수만 재수행하는것으로 대체 가능한지 테스트 필요
		if (obj.extv.dialogMap[moduleName] == 'show') {
			obj.hideDialog(moduleName)
		}

		// 팝업이 있는지 확인필요
		obj.lockDialog = true
		var executeEvent = function () {
			obj.f[moduleName].dialogSeq = obj.dialogSeq
			// $("#" + obj.f[moduleName].dlg_id).css("z-index", 30000 + obj.dialogSeq);
			document.getElementById(obj.f[moduleName].dlg_id).style.zIndex = 30000 + obj.dialogSeq

			console.log(moduleName + ':' + obj.f[moduleName].dialogSeq + ': ' + document.getElementById(obj.f[moduleName].dlg_id).style.zIndex)

			obj.dialogSeq++
			// obj.screenFix();
			document.getElementById('mainPopup').style.display = 'flex'

			//다이얼로그를 콜할 때 다음 함수가 있으면 호출한다
			if (typeof obj.f[moduleName].dialogInit === 'function') {
				obj.f[moduleName].dialogInit(opt)
			} else {
				console.warn('dialog를 호출하였는데 해당 module에 dialogInit 함수가 없음')
			}
			setTimeout(function () {
				document.getElementById(obj.f[moduleName].dlg_id).classList.add('show')
			}, 1)

			obj.extv.dialogMap[moduleName] = 'show'
			obj.extv.dialogList.push(moduleName)

			obj.lockDialog = false
		}
		console.log('[다이얼로그-로드]' + moduleName)
		if (AMP.devMode || typeof this.f[moduleName] === 'undefined') {
			//해당코드는 외부 의존성이 생기는 코드이므로 변경 필요
			// 우선 showLoading, hideLoading 은 주석처리 (화면 깜빡임 문제 생김)
			// obj.showLoading();
			// console.log("[다이얼로그-호출-에러]"+moduleName + " 이 선언되지 않았습니다.");
			obj.runMultiModule([moduleName], {}, arguments, function () {
				// obj.hideLoading();
				console.log('AM 로딩 완료 => 모듈명 : ' + moduleName)
				executeEvent()
				// setTimeout(() => {
				//     $('.popupWrapper').draggable({
				//         cancel: '.popupContent, .popupButtons, .optionLists',
				//         cursor: 'move',
				//     })
				// }, 0)
				if (typeof args !== 'undefined' && typeof args.callback === 'function') args.callback()
			})
		} else {
			executeEvent()
		}
	},
	hideDialog: function (moduleName) {
		var obj = this
		obj.lockDialog = true

		// dialog 명을 안보내면 자동으로 최상위 dialog 닫음
		if (moduleName === undefined) {
			moduleName = obj.extv.dialogList[obj.extv.dialogList.length - 1]
		}

		if (typeof obj.f[moduleName] === 'undefined') {
			console.warn('[다이얼로그가 없습니다] ' + moduleName)
			obj.lockDialog = false
			return
		}

		document.getElementById(obj.f[moduleName].dlg_id).classList.remove('show')
		document.getElementById(obj.f[moduleName].dlg_id).ontransitionend = function (event) {
			if (!event.target.className.split(' ').includes('AMP_DIALOGS')) {
				return
			}
			if (event.target.className.split(' ').includes('show') || !['opacity'].includes(event.propertyName)) {
				// 등장 animation은 무시
				return
			}
			obj.extv.dialogMap[moduleName] = ''
			//다이얼로그를 콜할 때 다음 함수가 있으면 호출한다
			if (typeof obj.f[moduleName].dialogClose === 'function') this.f[moduleName].dialogClose()

			var hasPopup = false
			var r1 = AMP.mapToArr(obj.extv.dialogMap)
			for (var i = 0; i < r1.length; i++) {
				if (r1[i].value == 'show') {
					hasPopup = true
				}
			}

			//해당모듈의 팝업을 리스트에서 삭제
			if (obj.extv.dialogList.length >= 1) {
				var index = obj.extv.dialogList.indexOf(moduleName)
				if (index !== -1) obj.extv.dialogList.splice(index, 1)
			}

			// 이전에 떠있는 팝업이 있는 경우 기존 팝업을 다시 띄움
			if (obj.extv.dialogList.length >= 1) {
				var topPopupName = obj.extv.dialogList[obj.extv.dialogList.length - 1]
				if (typeof obj.f[topPopupName] !== 'undefined') {
					document.getElementById(obj.f[topPopupName].dlg_id).classList.add('show')
					hasPopup = true
				}
			}
			// 남은 팝업이 없을 경우
			if (!hasPopup) {
				document.getElementById('mainPopup').style.display = null
			}
			obj.lockDialog = false
		}
	},
	removeDialog: function (moduleName) {
		var child = document.getElementById(this.f[moduleName].dlg_id)
		child.parentNode.removeChild(child)
	},
	hasPopup: function () {
		return this.extv.dialogList.length > 0
	},
	/** 팝업닫기 우선 수행. 팝업이 없을 경우 false 리턴 */
	popupClosed: function () {
		var obj = this
		if (obj.hasPopup()) {
			//팝업이 있을 경우 하나를 닫음
			var name = obj.extv.dialogList[obj.extv.dialogList.length - 1]
			// if (AMP.f[name].useData.isForce) {
			//     return false;
			// }
			if (obj.f[name].useData && obj.f[name].useData.isForce) {
				if (typeof obj.f[name].useData.cancelClick === 'function') this.f[name].useData.cancelClick()
			} else {
				obj.hideDialog(name)
			}
			return true
		} else {
			return false
		}
	},
	/** 팝업 관련 함수들 END */
	/** android 기기의 software back 이나 화면상의 Back 버튼 공통 처리 */
	// defaultBack: function () {
	//     if (!AMP.popupClosed()) {
	//         AMP.historyBack();
	//     }
	// },
	historyBack: function () {
		this.showLoading()
		history.back()
	},
	/** Vue 객체에 변수를 할당하는 함수 : 사용되지 않는 것 같음 */
	setVueValue: function (key, value) {
		this.assignValueToArray(AMP.extv.vueData['AMP_CONTENT'], key, value)
	},
	assignValueToArray: function (arr, key, value) {
		var ids = key.split('.')
		if (ids.length == 1) arr[ids[0]] = value
		else if (ids.length == 2) arr[ids[0]][ids[1]] = value
		else if (ids.length == 3) arr[ids[0]][ids[1]][ids[2]] = value
	},
	// API와 뷰를 연결하여 데이터 업데이트 : 사용되지 않음
	updateLayout: function (url, vue, param, data_event, event) {
		this.api(
			url,
			param,
			function (data) {
				// var jdata = AMP.parseJSON(data);
				var d1 = data_event(data)
				//console.log(d1);
				var r1 = AMP.mapToArr(d1)
				for (var i = 0; i < r1.length; i++) {
					vue[r1[i].key] = r1[i].value
				}

				if (typeof event != 'undefined') event(data)
			},
			{},
		)
	},
})
var amp = AMP
