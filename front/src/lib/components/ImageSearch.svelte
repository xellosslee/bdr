<script>
	import lib from '$lib'
	export let popupItem = {}
	let popupImageList = [] // 팝업 검색 결과 (최대 10개) 노출용 리스트
	let searchImageText = '' // 팝업의 이미지 검색 기록 저장용 temp 변수
	let popupImageSearch = ''
	async function imageSearch(event) {
		let name = event.target.value
		console.log('searchText', name)
		if (name == '') {
			return
		}
		var pattern = /([^가-힣\x20])/i
		if (pattern.test(name)) {
			console.log('자음,모음만 있는 경우 검색 안함')
			return
		}
		if (searchImageText == name) {
			console.log('지난 검색 단어와 같은 경우 무시')
			return
		}
		searchImageText = name
		let result = await lib.api({ url: '/file/list', data: { name, page: 0 } })
		console.log(result)
		popupImageList = result.data.rows
	}
	function chooseImage(event) {
		popupItem.itemImage.name = popupImageList[event.currentTarget.dataset.imageIdx].name
		popupItem.itemImage.fileId = popupImageList[event.currentTarget.dataset.imageIdx].fileId
		// 검색 초기화
		popupImageList = []
		searchImageText = ''
		popupImageSearch = ''
	}
</script>

<div class="props.class">
	<div class="inputTitle">
		이미지 검색 <input list="image-list" on:keyup={imageSearch} value={popupImageSearch} />
		{#if popupItem?.itemImage?.name}<div>선택된 이미지 : {popupItem?.itemImage?.name}</div>{/if}
	</div>
	{#each popupImageList as popupImage, i}
		<button on:click={chooseImage} data-image-idx={i}><img src={popupImage.imgUrl ? 'http://127.0.0.1:7700' + popupImage.imgUrl : ''} alt={popupImage.name} />{popupImage.name}</button>
	{/each}
</div>

<style>
</style>
