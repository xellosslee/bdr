<script>
	import lib from '$lib'
	import logo from '$lib/img/blackSpirit.png'
	let searchText = ''
	let searchedText = ''
	let searchItems = []

	async function keyupEvent(evt) {
		if (evt.key == 'Enter' && searchItems.length > 0) {
			location.href = location.protocol + '//' + location.host + searchItems[0].url
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
		if (evt.target.value && searchedText != evt.target.value) {
			// 단어의 변경이 없으면 재조회 안하도록 수정
			searchedText = evt.target.value
			let data = { search: evt.target.value }
			console.log(data)
			let result = await lib.api({ url: '/item/fast/search', data })
			// 검색결과 출력
			console.log(result)
			if (result.code == '00' && result.data.length > 0) {
				searchItems = result.data
			} else {
				searchItems = []
				// autoCompleteFocusCnt = -1
			}
		}
	}
</script>

<header class="contentHeader">
	<a href="/"><div class="homeLink"><img src={logo} alt="흑정령(홈아이콘)" /></div></a>
	<div class="searchWrap">
		<input type="text" bind:value={searchText} on:keyup={keyupEvent} placeholder="파트너! 어서 궁금한 아이템명을 입력해봐!" spellcheck="false" />
		<div id="autoComplete" class={searchItems.length == 0 ? 'empty' : ''}>
			{#each searchItems as e}
				<a class="miniItemLabel" href={e.itemUrl} target="_self">
					<img class="miniItem" src={lib.apiUrl + e.imgUrl} alt={e.name} /><span>{e.name}</span>
				</a>
			{/each}
		</div>
		<div id="toolBox" class="empty">
			<div class="historyWrap">
				<div>검색기록</div>
				<div id="historyList">
					<li />
				</div>
			</div>
			<div class="bookmarkWrap">
				<div>북마크</div>
				<div id="bookmarkList">
					<li />
				</div>
			</div>
		</div>
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
	}
	.contentHeader .searchWrap > div#autoComplete.empty,
	.contentHeader .searchWrap > div#toolBox.empty {
		display: none;
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
		border: 1px solid var(--gray-color3);
		border-radius: 4px;
	}

	.miniItemLabel {
		display: flex;
		align-items: center;
		line-height: min(22px, 5.6410256vw);
		padding: 4px 6px;
		color: var(--point-color);
		font-size: min(15px, 3.8461538vw);
		border-radius: 4px;
	}

	.miniItemLabel > a:has(.miniItem) {
		display: flex;
	}

	.miniItemLabel:hover {
		background: var(--point-color);
		cursor: pointer;
		color: #fff;
	}

	.miniItemLabel span {
		margin-left: 4px;
	}
</style>
