// import puppeteer from 'puppeteer'
const puppeteer = require('puppeteer')
// let itemArray = [816, 1344, 1432, 1432, 1439, 1962, 1962, 1965]
// let arrayIdx = 0
let arrayVersion = false
// let itemId = itemArray[arrayIdx]
let itemId = 1
let isSingleRun = false
main()
var browser = null
async function main() {
	// 헤드리스 브라우저 cli 페이지 로딩
	if (browser == null) {
		browser = await puppeteer.launch({
			// headless: false, // test show page flag
		})
	}
	const [page] = await browser.pages()
	await page.goto(`https://bdo.weingchicken.com/crafting-notes/${itemId}`, {
		// 모든 네트워크 연결이 500ms 이상 유휴 상태가 될 때까지 기다림
		waitUntil: 'networkidle0',
	})
	await page.waitForFunction(
		async (itemId) => {
			// 함수가 웹브라우저의 컨텍스트에서 실행되기 때문에 document 객체에 접근 가능
			if (document.title == 'Not Found') {
				console.log('error !!!')
				return 1
			} else if (document.querySelectorAll('main').length > 0) {
				///////
				// chrome console version test
				///////
				var img = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex img').src
				var name = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex h3').textContent
				var desc = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex p').innerHTML

				var earnListTemp = document.body.querySelectorAll('main > div > div > div.overflow-hidden > div.border-t')[1].querySelectorAll('div.flow-root>ul>li')
				var earnList = []
				earnListTemp.forEach((e) => {
					if (e.querySelector('li') == null) {
						// 획득 아이템
						earnList.push({
							type: 'get',
							work: e.querySelector('div > h3')?.textContent?.trim() || '',
							path: e.querySelector('p')?.textContent?.trim() || '',
						})
					} else {
						// 제조 아이템
						var craftListHtml = e.querySelectorAll('li')
						var craftList = []
						craftListHtml.forEach((c) => {
							craftList.push({
								itemId: c.querySelector('a')?.href.substring(c.querySelector('a').href.lastIndexOf('/') + 1),
								count: c.querySelectorAll('span')[2]?.textContent.trim(),
							})
						})
						earnList.push({
							type: 'craft',
							work: e.querySelector('div > h3')?.innerHTML.substring(0, e.querySelector('div > h3').innerHTML.indexOf('<')).trim() || '',
							craftList,
						})
					}
				})
				var usageTemp = document.body.querySelectorAll('main > div > div > div.overflow-hidden > div.border-t')[2].querySelectorAll('li')
				var usageList = []
				usageTemp.forEach((e) => {
					usageList.push({
						resultItemCd: e.querySelector('a').href.substring(e.querySelector('a').href.lastIndexOf('/') + 1),
						name: e.querySelector('span').textContent.trim(),
					})
				})
				item = { itemId, fileId: itemId, imgUrl: img, name, desc, earnList, usageList }
				console.log(item)
				let data = { item }
				await fetch(`http://localhost:7700/item/put`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
				///////
				return 1
			}
			return false
		},
		{ timeout: 50000 },
		itemId,
	)
	if (isSingleRun) {
		process.exit(0)
	}
	// 다음 아이템 검색
	if (arrayVersion) {
		arrayIdx++
		if (itemArray.length <= arrayIdx) {
			process.exit(0)
		}
		itemId = itemArray[arrayIdx]
	} else {
		itemId += 1
		if (itemId >= 2800) {
			process.exit(0)
		}
	}
	setTimeout(main, 100)
}
