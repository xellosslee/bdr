<script>
	import lib from '$lib'
	export let popupItem = null
	export let inputWidth = null
	export let craft = null
	export let ignoreImg = false
	let searchResultList = [] // 팝업 검색 결과 (최대 10개) 노출용 리스트
	let searchTextBefore = '' // 팝업의 이미지 검색 기록 저장용 temp 변수
	let searchText = ''
	async function search(event) {
		let name = event.target.value
		if (name == '') {
			return
		}
		var pattern = /([^가-힣\x20])/i
		if (pattern.test(name)) {
			console.debug('자음,모음만 있는 경우 검색 안함')
			return
		}
		if (searchTextBefore == name) {
			console.debug('지난 검색 단어와 같은 경우 무시')
			return
		}
		searchTextBefore = name
		let result = await lib.api({ url: '/item', data: { search: name } })
		console.log(result)
		searchResultList = result.data
	}
	function choose(event) {
		if (craft) {
			craft.url = searchResultList[event.currentTarget.dataset.imageIdx].url
			craft.imgUrl = searchResultList[event.currentTarget.dataset.imageIdx].imgUrl
		} else {
			let i = popupItem.Usages.findIndex((e) => e.url == searchResultList[event.currentTarget.dataset.imageIdx].url)
			if (i != -1) {
				alert('동일한 아이템이 추가되어 있습니다.')
			} else {
				popupItem.Usages.push(searchResultList[event.currentTarget.dataset.imageIdx])
				popupItem.Usages = popupItem.Usages
			}
		}
		// 검색 초기화
		searchResultList = []
		searchTextBefore = ''
		searchText = ''
	}
</script>

<div class="inputTitle">
	아이템
	{#if craft?.imgUrl && !ignoreImg}
		<img class="miniItem" src={craft.imgUrl.replace('/images', '')} alt="현재 이미지 or 교체될 이미지" />
	{/if}
	<input on:keyup={search} value={searchText} style={inputWidth ? 'width:' + inputWidth + 'px' : ''} placeholder="검색어 입력" />
	{#if searchResultList.length > 0}
		<div class="wrap">
			{#each searchResultList as searchItem, i}
				<button class="miniItemLabel" on:click={choose} data-image-idx={i}>
					<img class={'miniItem'} src={searchItem?.imgUrl ? searchItem?.imgUrl?.replace('/images', '') : ''} alt={searchItem.name} />
					<span>{searchItem.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.inputTitle {
		position: relative;
	}
	.inputTitle > .wrap {
		position: absolute;
		background: white;
		border: 1px solid #bbb;
		border-radius: 4px;
		width: 300px;
		z-index: 9;
	}
	.inputTitle > input {
		width: 50px;
	}
	.miniItemLabel {
		display: flex;
		width: 100%;
		align-items: center;
		line-height: min(22px, 5.6410256vw);
		padding: 4px 6px;
		color: var(--point-color);
		font-size: min(15px, 3.8461538vw);
		border-radius: 4px;
	}
	.miniItemLabel span {
		margin-left: 4px;
	}
	img.miniItem {
		width: min(22px, 5.6410256vw);
		height: min(22px, 5.6410256vw);
		border: 2px solid var(--gray-color3);
		border-radius: 4px;
	}
	img.miniItem {
		width: min(22px, 5.6410256vw);
		height: min(22px, 5.6410256vw);
		border: 2px solid var(--gray-color3);
		border-radius: 4px;
	}
</style>
