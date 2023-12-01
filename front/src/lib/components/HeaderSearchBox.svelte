<script>
	import lib from '$lib'
	import logo from '$lib/img/blackSpirit.png'
	import { clickOutside } from '$lib/closeOutside.js'
	import { addByCloseFunction, popCloseFunction, bookmarkStore, searchStore } from '$lib/store'
	import { onMount } from 'svelte'

	let searchText = ''
	let searchedText = ''
	let searchItems = []
	let boxOpened = false
	let position = 0
	let bookmarkList = []
	let searchHistory = []
	onMount(async () => {
		for (let k of Object.keys(localStorage)) {
			if (k.indexOf('bookmark-') != -1) {
				bookmarkList.push({
					...JSON.parse(localStorage[k]),
					url: '/' + k.substring(9),
				})
			}
			if (k.indexOf('search-') != -1) {
				searchHistory.push({
					...JSON.parse(localStorage[k]),
					url: '/' + k.substring(7),
				})
			}
		}
		// 화면 랜딩 시 초기화
		bookmarkStore.set(bookmarkList)
		searchStore.set(searchHistory)
		bookmarkStore.subscribe((e) => {
			bookmarkList = e
		})
		searchStore.subscribe((e) => {
			searchHistory = e
		})
	})
	function handleClickOutside(event) {
		boxOpened = false
		popCloseFunction()
	}
	async function keyupEvent(evt) {
		if (evt.key == 'Enter' && searchItems.length > 0 && searchItems[position]?.itemUrl) {
			moveSearchResult(searchItems[position])
			return
		}
		if (searchText == '') {
			searchItems = []
			return
		}
		var pattern = /([^가-힣\x20])/i
		if (pattern.test(evt.target.value)) {
			console.log('자음,모음만 있는 경우 검색 안함')
			return
		}
		if (evt.key == 'ArrowUp') {
			position--
			if (position < 0) {
				position = searchItems.length - 1
			}
		} else if (evt.key == 'ArrowDown') {
			position++
			if (position >= searchItems.length) {
				position = 0
			}
		}
		if (evt.target.value && searchedText != evt.target.value) {
			// 단어의 변경이 없으면 재조회 안하도록 수정
			searchedText = evt.target.value
			let data = { search: evt.target.value }
			let result = await lib.api({ url: '/item/fast-search', data })
			// 검색결과 출력
			console.debug(result)
			if (result.code == '00' && result.data.length > 0) {
				searchItems = result.data
			} else {
				searchItems = []
			}
			if (!boxOpened) {
				openBox()
			}
		}
	}
	async function openBox() {
		boxOpened = true
		// box 닫힘 함수를 등록
		addByCloseFunction(handleClickOutside)
	}
	function moveSearchResult(item) {
		searchStore.set([
			...searchHistory,
			{
				url: item.itemUrl,
				name: item.name,
				imgUrl: item.imgUrl,
			},
		])
		localStorage.setItem('search-' + item.itemUrl.substring(1), JSON.stringify({ name: item.name, imgUrl: item.imgUrl.replace('/images', '') }))
		location.href = item.itemUrl
	}
	function removeAllSearch() {
		for (let k of Object.keys(localStorage)) {
			if (k.indexOf('search-') != -1) {
				localStorage.removeItem(k)
			}
		}
		searchHistory = []
	}
	function removeAllBookmark() {
		for (let k of Object.keys(localStorage)) {
			if (k.indexOf('bookmark-') != -1) {
				localStorage.removeItem(k)
			}
		}
		bookmarkList = []
	}
</script>

<header class="contentHeader" use:clickOutside on:click_outside={handleClickOutside}>
	<a href="/" target="_self"><div class="homeLink"><img src={logo} alt="흑정령(홈아이콘)" /></div></a>
	<div class="searchWrap">
		<input type="text" bind:value={searchText} on:keyup={keyupEvent} on:focus={openBox} placeholder="파트너! 어서 궁금한 아이템명을 입력해봐!" spellcheck="false" />
		{#if boxOpened && searchItems.length > 0}
			<div id="autoComplete">
				{#each searchItems as e, i}
					<button
						class={'miniItemLabel ' + (position == i ? 'selected' : '')}
						on:click={() => {
							moveSearchResult(e)
						}}
					>
						<img class={'miniItem grade' + e.grade} src={e.imgUrl.replace('/images', '')} alt={e.name} /><span>{e.name}</span>
					</button>
				{/each}
			</div>
		{:else if boxOpened}
			<div id="toolBox">
				<div class="historyWrap">
					<div class="title">최근 검색 ({searchHistory.length}건)<button class="remove" on:click={removeAllSearch}><img src="/trashcan.svg" alt="remove all search history" /></button></div>
					<div class="resultBox">
						{#if searchHistory.length == 0}
							<span class="notExist">검색 기록이 없습니다.</span>
						{/if}
						{#each searchHistory as e, i}
							<a class="miniItemLabel" href={e.url} target="_self"><img class="miniItem" alt={e.name} src={e.imgUrl} /><span>{e.name}</span></a>
						{/each}
					</div>
				</div>
				<div class="bookmarkWrap">
					<div class="title">북마크 ({bookmarkList.length}건)<button class="remove" on:click={removeAllBookmark}><img src="/trashcan.svg" alt="remove all bookmark history" /></button></div>
					<div class="resultBox">
						{#if bookmarkList.length == 0}
							<span class="notExist">아직 북마크가 없습니다.</span>
						{/if}
						{#each bookmarkList as e, i}
							<a class="miniItemLabel" href={e.url} target="_self"><img class="miniItem" alt={e.name} src={e.imgUrl} /><span>{e.name}</span></a>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</header>

<style>
	.contentHeader {
		display: flex;
		align-items: center;
		margin: 20px auto;
		width: min(95%, 1024px);
	}

	.contentHeader .homeLink {
		width: min(40px, 10.26vw);
		height: min(40px, 10.26vw);
		margin-right: 10px;
	}

	.contentHeader .homeLink > img {
		width: 100%;
	}

	.contentHeader .searchWrap {
		position: relative;
		width: 100%;
		position: relative;
		border: 1px solid var(--gray-color2);
		padding: min(8px, 2.0512821vw) min(10px, 2.5641026vw);
		border-radius: 4px;
	}
	.contentHeader .searchWrap > input[type='text'] {
		width: 100%;
		font-size: min(16px, 4.10256vw);
		border: none;
	}
	.contentHeader .searchWrap > div#autoComplete,
	.contentHeader .searchWrap > div#toolBox {
		position: absolute;
		background: white;
		left: 0;
		top: 120%;
		width: 100%;
		font-size: min(16px, 4.1025641vw);
		line-height: 44px;
		border: 1px solid var(--gray-color2);
		border-radius: 4px;
		z-index: 8;
	}
	.contentHeader .searchWrap > div#autoComplete.empty,
	.contentHeader .searchWrap > div#toolBox.empty {
		display: none;
	}
	.resultBox {
		max-height: 310px;
		overflow-x: hidden;
		overflow-y: auto;
	}
	.title {
		display: flex;
		align-items: center;
	}
	button.remove {
		margin-left: auto;
		margin-right: 10px;
	}
	button.remove > img {
		width: 17px;
		height: 17px;
	}

	.contentHeader .searchWrap > div#toolBox {
		display: flex;
	}

	.contentHeader .searchWrap > div#toolBox {
		display: flex;
	}

	.contentHeader .searchWrap > div#toolBox > div {
		width: 100%;
		padding: 6px;
		font-weight: 600;
	}

	img.miniItem {
		width: min(22px, 5.6410256vw);
		height: min(22px, 5.6410256vw);
		border: 2px solid var(--gray-color3);
		border-radius: 4px;
	}

	.miniItemLabel {
		width: 100%;
		display: flex;
		align-items: center;
		line-height: min(22px, 5.6410256vw);
		padding: 4px 6px;
		color: var(--point-color);
		font-size: min(15px, 3.8461538vw);
		border-radius: 4px;
	}

	.miniItemLabel.selected,
	.miniItemLabel:hover {
		background: var(--point-color);
		cursor: pointer;
		color: #fff;
	}

	.miniItemLabel span {
		margin-left: 4px;
	}

	img.miniItem.grade1,
	.itemImg.grade1 {
		border-color: var(--grade1);
		box-sizing: border-box;
	}
	img.miniItem.grade2,
	.itemImg.grade2 {
		border-color: var(--grade2);
		box-sizing: border-box;
	}
	img.miniItem.grade3,
	.itemImg.grade3 {
		border-color: var(--grade3);
		box-sizing: border-box;
	}
	img.miniItem.grade4,
	.itemImg.grade4 {
		border-color: var(--grade4);
		box-sizing: border-box;
	}
	img.miniItem.grade5,
	.itemImg.grade5 {
		border-color: var(--grade5);
		box-sizing: border-box;
	}
</style>
