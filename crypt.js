// note: encoded data is NOT encrypted
const crypto = require('crypto')
const CRYPTO_KEY = Buffer.from('NoCKvdLslUuB4y3EZlKate1XGottHski1LmyqJHvUhs=', 'base64')
const ALGORITHM2 = 'aes-256-cbc'
const ALGORITHM = 'aes-256-ctr'
const IV_LENGTH = 16
const IV = '72a84cbd-977b-40' // encode, decode, encrypt에 쓰임

// 암호화
const encode = (str) => {
	try {
		let cipher = crypto.createCipheriv(ALGORITHM2, Buffer.from(CRYPTO_KEY, 'hex'), IV)
		return Buffer.from(cipher.update(str, 'utf8', 'hex') + cipher.final('hex')).toString('base64')
	} catch (err) {
		console.error(err)
	}
}
// 복호화
const decode = (str) => {
	try {
		let buf = Buffer.from(str, 'base64')
		let decipher = crypto.createDecipheriv(ALGORITHM2, Buffer.from(CRYPTO_KEY, 'hex'), IV)
		return decipher.update(buf.toString('utf8'), 'hex', 'utf8') + decipher.final('utf8')
	} catch (err) {
		if (err.message == 'Invalid initialization vector') {
			console.error('복호화 되지 않은 데이터')
			return str
		} else {
			console.error('암호화 된 값이 아님')
			return null
		}
	}
}
// 구버전 password MD5 이후 첫글자 제외하여 비교 필요
const md5Encrypt = (password) => {
	let pwd = crypto.createHash('md5').update(password).digest('hex')
	let startIdx = 0
	for (c of pwd) {
		if (c == 0) {
			startIdx++
		} else {
			break
		}
	}
	return pwd.substring(startIdx)
}
// 암호화 : salt 포함 키
const encodeWithSalt = (password) => {
	return new Promise((resolve, reject) => {
		let iv = crypto.randomBytes(IV_LENGTH)
		let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(CRYPTO_KEY, 'hex'), iv)
		let encrypted = cipher.update(password)
		encrypted = Buffer.concat([encrypted, cipher.final()])
		resolve(iv.toString('hex') + ':' + encrypted.toString('hex'))
	})
}
// 복호화 : salt 포함 키
const decodeWithSalt = (password) => {
	return new Promise((resolve, reject) => {
		if (!password) {
			return resolve(password)
		}
		try {
			let textParts = password.split(':')
			let iv = Buffer.from(textParts.shift(), 'hex')
			let encryptedText = Buffer.from(textParts.join(':'), 'hex')
			let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(CRYPTO_KEY, 'hex'), iv)
			let decrypted = decipher.update(encryptedText)
			decrypted = Buffer.concat([decrypted, decipher.final()])
			resolve(decrypted.toString())
		} catch (err) {
			if (err.message == 'Invalid initialization vector') {
				console.error('복호화 되지 않은 데이터')
				resolve(password)
			} else {
				console.error(err)
			}
		}
	})
}
// 단방향 암호화
const encrypt = (password, customIv) => {
	// console.debug(`Buffer.from(CRYPTO_KEY, 'hex')`, Buffer.from(CRYPTO_KEY, 'hex'))
	// let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(CRYPTO_KEY, 'hex'), IV)
	let iv = customIv ? customIv : IV
	// console.debug(`CRYPTO_KEY`, process.env.CRYPTO_KEY, CRYPTO_KEY, CRYPTO_KEY.length)
	let cipher = crypto.createCipheriv(ALGORITHM, CRYPTO_KEY, iv)
	let encrypted = cipher.update(password)
	// console.debug('password', password)
	// console.debug('encrypted', encrypted)
	// console.debug(`encrypted.toString('hex')`, encrypted.toString('hex'))

	return encrypted.toString('hex')
}
// console.log('encrypt', encrypt('2023-06-29 10:58'))
// console.log('encrypt pos', encrypt('2023-06-29 10:58', process.env.CRYPTO_POS_IV))
// console.log('encrypt web', encrypt('2023-06-29 10:58', process.env.CRYPTO_WEB_IV))

module.exports = {
	encode,
	decode,
	encodeWithSalt,
	decodeWithSalt,
	md5Encrypt,
	encrypt,
}
