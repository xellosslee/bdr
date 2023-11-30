<script>
	import lib from '$lib'
	export let popupItem = {}
	let popupImageList = [] // 팝업 검색 결과 (최대 10개) 노출용 리스트
	let searchImageText = '' // 팝업의 이미지 검색 기록 저장용 temp 변수
	let popupImageSearch = ''
	async function imageSearch(event) {
		let name = event.target.value
		if (name == '') {
			return
		}
		var pattern = /([^가-힣\x20])/i
		if (pattern.test(name)) {
			console.debug('자음,모음만 있는 경우 검색 안함')
			return
		}
		if (searchImageText == name) {
			console.debug('지난 검색 단어와 같은 경우 무시')
			return
		}
		searchImageText = name
		let result = await lib.api({ url: '/file/list', data: { name, page: 0 } })
		console.log(result)
		popupImageList = result.data.rows
	}
	function chooseImage(event) {
		popupItem.itemImage.imgUrl = popupImageList[event.currentTarget.dataset.imageIdx].imgUrl
		popupItem.itemImage.fileId = popupImageList[event.currentTarget.dataset.imageIdx].fileId
		// 검색 초기화
		popupImageList = []
		searchImageText = ''
		popupImageSearch = ''
	}
</script>

<div class="inputTitle">
	이미지 <img class="miniItem" src={lib.apiUrl + popupItem?.itemImage?.imgUrl} alt="현재 이미지, 교체될 이미지" />
	검색 <input list="image-list" on:keyup={imageSearch} bind:value={popupImageSearch} />
	<div class="wrap">
		{#each popupImageList as popupImage, i}
			<button class="miniItemLabel" on:click={chooseImage} data-image-idx={i}>
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
	.miniItemLabel:hover {
		background: var(--point-color);
		cursor: pointer;
		color: #fff;
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
