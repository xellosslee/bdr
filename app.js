// import puppeteer from 'puppeteer'
const puppeteer = require('puppeteer')

let itemId = 2600
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
		// ❸ 모든 네트워크 연결이 500ms 이상 유휴 상태가 될 때까지 기다림
		waitUntil: 'networkidle0',
	})
	await page.waitForFunction(
		async (itemId) => {
			// ➎ 함수가 웹브라우저의 컨텍스트에서 실행되기 때문에 document 객체에 접근 가능
			if (document.title == 'Not Found') {
				console.log('error !!!')
				return 1
			} else if (document.querySelectorAll('main').length > 0) {
				///////
				// chrome console version test
				///////
				var img = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex img').src
				var name = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex h3').textContent
				var desc = document.body.querySelector('main > div > div > div.overflow-hidden > div.inline-flex p').textContent

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
						itemId: e.querySelector('a').href.substring(e.querySelector('a').href.lastIndexOf('/') + 1),
						name: e.querySelector('span').textContent.trim(),
					})
				})
				finalItem = { itemId, imgUrl: img, name, desc, earnList, usageList }
				console.log(finalItem)
				let data = { finalItem }
				await fetch(`http://localhost:7700/item/put`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
				///////
				return 1
			}
			return false
		},
		{ timeout: 50000 },
		itemId,
	)
	// var test = await page.$('main > div > div > div.overflow-hidden > div.inline-flex img')
	// var tt = await page.$$('main > div > div > div.overflow-hidden > div.inline-flex h3')
	// var test2 = await tt[0].getProperty('textContent')
	// var ta = await test2.jsonValue()
	// let imgEl = await page.$('main > div > div > div.overflow-hidden > div.inline-flex img')
	// var img = await (await imgEl.getProperty('src')).jsonValue()
	// console.log(ta)
	// console.log(img)
	// ///////
	// var img = await (await (await page.$('main > div > div > div.overflow-hidden > div.inline-flex img')).getProperty('src')).jsonValue()
	// var name = await (await (await page.$('main > div > div > div.overflow-hidden > div.inline-flex h3')).getProperty('textContent')).jsonValue()
	// var desc = await (await (await page.$('main > div > div > div.overflow-hidden > div.inline-flex p')).getProperty('textContent')).jsonValue()
	// var earnListTemp = await (await page.$$('main > div > div > div.overflow-hidden > div.border-t'))[1].$$('div.flow-root>ul>li')
	// // document.body.querySelectorAll('main > div > div > div.overflow-hidden > div.border-t')[1].querySelectorAll('div.flow-root>ul>li')
	// var earnList = []
	// for (let i = 0; i < earnListTemp.length; i++) {
	// 	let e = earnListTemp[i]
	// 	let li = await e.$$('li')
	// 	if (Array.isArray(li) && li.length == 0) {
	// 		// 획득 아이템
	// 		let h3 = await e.$('div > h3')
	// 		let h3Value
	// 		if (h3 != null) {
	// 			h3Value = (await (await h3.getProperty('textContent')).jsonValue()).trim()
	// 		}
	// 		let p = await e.$('p')
	// 		let pValue
	// 		if (p != null) {
	// 			pValue = (await (await p.getProperty('textContent')).jsonValue()).trim()
	// 		}
	// 		earnList.push({
	// 			type: 'get',
	// 			work: h3Value,
	// 			path: pValue,
	// 		})
	// 	} else {
	// 		// 제조 아이템
	// 		var craftListHtml = e.$$('li')
	// 		var craftList = []
	// 		for (let j = 0; j < craftListHtml.length; j++) {
	// 			let c = craftListHtml[j]
	// 			let itemHref = await (await (await c.$('a')).getProperty('href')).jsonValue()
	// 			craftList.push({
	// 				itemId: itemHref.substring(itemHref.lastIndexOf('/') + 1),
	// 				count: (await (await (await c.$$('span'))[2].getProperty('textContent')).jsonValue()).trim(),
	// 				// itemId: c.querySelector('a')?.href.substring(c.querySelector('a').href.lastIndexOf('/') + 1),
	// 				// count: c.querySelectorAll('span')[2]?.textContent.trim(),
	// 			})
	// 		}
	// 		let workType = await (await (await e.$('div > h3')).getProperty('innerHTML')).jsonValue()
	// 		earnList.push({
	// 			type: 'craft',
	// 			work: workType.substring(0, workType.indexOf('<')).trim() || '',
	// 			craftList,
	// 		})
	// 	}
	// }
	// var usageTemp = await (await page.$$('main > div > div > div.overflow-hidden > div.border-t'))[2].$$('li')
	// // document.body.querySelectorAll('main > div > div > div.overflow-hidden > div.border-t')[2].querySelectorAll('li')
	// var usageList = []
	// for (let i = 0; i < usageTemp.length; i++) {
	// 	let e = usageTemp[i]
	// 	let itemHref = await (await (await e.$('a')).getProperty('href')).jsonValue()
	// 	usageList.push({
	// 		itemId: itemHref.substring(itemHref.lastIndexOf('/') + 1),
	// 		name: (await (await (await e.$('span')).getProperty('textContent')).jsonValue()).trim(),
	// 		// itemId: e.querySelector('a').href.substring(e.querySelector('a').href.lastIndexOf('/') + 1),
	// 		// name: e.querySelector('span').textContent.trim(),
	// 	})
	// }
	// var finalItem = { itemId, imgUrl: img, name, desc, earnList, usageList }
	// console.log(finalItem)

	// await DB.Item.create(finalItem)
	// await DB.Earn.bulkCreate(finalItem.earnList.map((e) => ({ ...e, itemId })))
	// await DB.Usages.bulkCreate(finalItem.usageList.map((e) => ({ ...e, useItemId: itemId })))
	// 다음 아이템 검색
	itemId += 1
	if (itemId == 6) {
		itemId++
	}
	if (itemId >= 2700) {
		process.exit(0)
	}
	setTimeout(main, 10)
}
