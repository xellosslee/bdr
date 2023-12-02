import mysql from 'mysql2/promise'
import { DB_HOST, DB_NAME, DB_USER, DB_PASS } from '$env/static/private'

let mysqlConn = null
export function getConn() {
	if (!mysqlConn) {
		mysqlConn = mysql.createConnection({
			host: DB_HOST,
			user: DB_USER,
			password: DB_PASS,
			database: DB_NAME,
		})
	}
	return mysqlConn
}
