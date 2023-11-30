<script>
	import lib from '$lib'
	import { onMount } from 'svelte'
	export let popupItem = {}
	export let type = 0
	let searchResultList = [] // 팝업 검색 결과 (최대 10개) 노출용 리스트
	let searchTextBefore = '' // 팝업의 이미지 검색 기록 저장용 temp 변수
	let searchText = ''
	onMount(() => {
		popupItem.chooseItem = {}
	})
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
		let result = await lib.api({ url: '/item/fast/search', data: { search: name } })
		console.log(result)
		searchResultList = result.data
	}
	function choose(event) {
		if (type == 0) {
			let i = popupItem.Usages.findIndex((e) => (e.resultItemCd || e.usageItems[0].itemCd) == searchResultList[event.currentTarget.dataset.imageIdx].itemCd)
			if (i != -1) {
				alert('동일한 아이템이 추가되어 있습니다.')
			} else {
				popupItem.Usages.push({ usageItems: [searchResultList[event.currentTarget.dataset.imageIdx]] })
				popupItem.Usages = popupItem.Usages
			}
		} else if (type == 1) {
		}
		// 검색 초기화
		searchResultList = []
		searchTextBefore = ''
		searchText = ''
	}
</script>

<div class="inputTitle">
	아이템 검색 <input list="image-list" on:keyup={search} value={searchText} />
	<div class="wrap">
		{#each searchResultList as popupImage, i}
			<button class="miniItemLabel" on:click={choose} data-image-idx={i}>
				<img class={'miniItem'} src={popupImage.imgUrl ? lib.apiUrl + popupImage.imgUrl : ''} alt={popupImage.name} />
				<span>{popupImage.name}</span>
			</button>
		{/each}
	</div>
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
