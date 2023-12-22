<script>
	import { fade } from 'svelte/transition'
	import ImageSearch from '$components/ImageSearch.svelte'
	import ItemSearch from '$components/ItemSearch.svelte'
	import lib from '$lib'
	export let popupItem = {}
	import { addByCloseFunction, popCloseFunction } from '$lib/store'
	let title = '아이템 수정'
	let uploadImage = {} // 업로드 대상 이미지 값 저장용
	let dimmedClickClose = true
	let editItem = structuredClone(popupItem)
	let clearItemClicked = false
	editItem.desc = editItem.desc.replace(/<br>/gi, '\n')
	console.debug(editItem)
	// 레이어 팝업 닫힘 함수를 등록
	addByCloseFunction(closeEditLayer)
	export function closeEditLayer() {
		console.log('called closeEditLayer')
		popupItem = null
		popCloseFunction()
	}
	async function doUpload() {
		if (!uploadImage) {
			return alert('이미지 선택되지 않았습니다.')
		}
		if (uploadImage.name == '') {
			return alert('이미지 이름을 적어주세요.')
		}
		let data = new FormData()
		data.append('image', uploadImage.file)
		data.append('name', uploadImage.name)
		let result = await lib.api({ url: '/file', method: 'PUT', data })
		if (result.code == '00') {
			alert('업로드 성공')
		} else {
			alert(result.message)
		}
	}
	function clearItem() {
		title = '아이템 생성'
		editItem.itemImage = {}
		editItem.Earns = []
		editItem.Usages = []
		setTimeout(() => {
			editItem = {
				itemImage: {},
				Earns: [],
				Usages: [],
			}
		}, 1)
		clearItemClicked = true
	}
	function resetItem() {
		title = '아이템 수정'
		editItem = structuredClone(popupItem)
		editItem.desc = editItem.desc.replace(/<br>/gi, '\n')
		clearItemClicked = false
	}
	function setImageName(evt) {
		let image = evt.currentTarget
		if (image.files.length > 0) {
			uploadImage.name = image.files[0].name.split('.')[0].normalize('NFC')
			uploadImage.file = image.files[0]
		} else {
			uploadImage = {}
		}
	}
	function dimmedClick() {
		if (dimmedClickClose) {
			closeEditLayer()
		}
	}
	function removeUsage(evt) {
		let newUsages = editItem.Usages.filter((e) => e.url != evt.target.dataset.url)
		editItem.Usages = newUsages
	}
	function addEarn() {
		editItem.Earns.push({ type: 'get', Crafts: [] })
		editItem.Earns = editItem.Earns
	}
	function removeEarn(evt) {
		let idx = evt.currentTarget.dataset.earnIdx
		editItem.Earns.splice(idx, 1)
		editItem.Earns = editItem.Earns
	}
	function addRecipeItem(evt) {
		let idx = evt.currentTarget.dataset.earnIdx
		editItem.Earns[idx].Crafts.push({})
		editItem.Earns[idx].Crafts = editItem.Earns[idx].Crafts
	}
	function removeRecipeItem(evt) {
		let idx = evt.currentTarget.dataset.earnIdx
		let craftIdx = evt.currentTarget.dataset.craftIdx
		editItem.Earns[idx].Crafts.splice(craftIdx, 1)
		editItem.Earns[idx].Crafts = editItem.Earns[idx].Crafts
	}
	async function save(evt) {
		console.debug(editItem)
		if (editItem.name == null || editItem.name == '') {
			return alert('아이템명을 작성 해주세요.')
		}
		if (editItem.grade == null || editItem.grade == '') {
			return alert('아이템 등급을 선택 해주세요.')
		}
		if (editItem.itemImage == null || editItem.itemImage.fileId == null) {
			return alert('이미지를 선택 해주세요.')
		}
		if (editItem.desc == null || editItem.desc == '') {
			return alert('아이템 설명을 작성 해주세요.')
		}
		let data = {
			itemIdEnc: editItem.itemIdEnc,
			itemCdEnc: editItem.itemCdEnc,
			...(editItem.name != popupItem.name ? { name: editItem.name } : {}),
			...(editItem?.itemImage?.fileId != null ? { fileId: editItem.itemImage.fileId } : {}),
			...(editItem.desc != popupItem.desc ? { desc: editItem.desc?.replace(/\n/gi, '<br>') } : {}),
			...(editItem.grade != popupItem.grade ? { grade: editItem.grade } : {}),
			Earns: editItem.Earns.map((e) => ({ work: e.work, path: e.path, type: e.type, Crafts: e.Crafts.map((ee) => ({ itemCd: ee.url.substring(1), count: ee.count })) })),
			Usages: editItem.Usages.map((e) => ({ resultItemCd: e.url.substring(1) })),
		}
		console.debug(data)
		let result = await lib.api({ url: '/item', method: 'PUT', data })
		if (result.code == '00') {
			alert('아이템이 등록 되었습니다.\n감사합니다.')
			closeEditLayer()
			location.reload()
		}
	}
</script>

<div class="layerPopup" transition:fade={{ duration: 300 }}>
	<button class="dimmed" on:click={dimmedClick} aria-roledescription="close btn" />
	<div class="box">
		<div class="popupTitle">{title}</div>
		<button class="closeBtn" on:click={closeEditLayer}><i class="icon ic16 icon-close" /></button>

		{#if editItem != null}
			<div class="box-container">
				<div class="inputWrap name">
					<div class="inputTitle">아이템명</div>
					<input type="text" class="label" bind:value={editItem['name']} placeholder="아이템명 입력" />
					<label class="inputTitle">
						아이템 등급
						<select bind:value={editItem.grade}>
							<option value={1}>흰색</option>
							<option value={2}>녹색</option>
							<option value={3}>파란색</option>
							<option value={4}>노란색</option>
							<option value={5}>빨강색</option>
						</select>
					</label>
				</div>
				<div class="inputWrap">
					<ImageSearch bind:popupItem={editItem} />
				</div>
				<div class="inputWrap imageUpload">
					<div class="inputTitle">이미지 파일 업로드</div>
					<input type="file" on:change={setImageName} /><input type="text" value={uploadImage.name || ''} placeholder="이미지 이름 입력" /><button class="btn" on:click={doUpload}
						>업로드하기</button
					>
				</div>
				<div class="inputWrap desc">
					<div class="inputTitle">아이템 설명</div>
					<textarea bind:value={editItem.desc}></textarea>
				</div>
				<div class="inputWrap crafts">
					<div class="inputTitle">
						획득 방법
						<button class="btn" style="margin-left: 5px;" on:click={addEarn}>추가</button>
					</div>
					<ul>
						{#each editItem.Earns as earn, i}
							<li class="earnWrap">
								<div>
									<select bind:value={earn.type}>
										<option value="get">획득/구매</option>
										<option value="craft">제작</option>
									</select>
									{#if earn.type == 'get'}
										<input type="text" bind:value={earn.work} placeholder="획득/구매방법" />
										<input type="text" bind:value={earn.path} placeholder="상세내용" />
									{:else}
										<input type="text" bind:value={earn.work} placeholder="제작방법" />
									{/if}
									<button class="btn inline" data-earn-idx={i} on:click={removeEarn}>삭제</button>
								</div>
								{#if earn.type == 'craft'}
									<ul class="row">
										{#each earn.Crafts as craft, x}
											<li class="col">
												<ItemSearch bind:craft />
												<div>
													<label><input type="text" class="count" bind:value={craft.count} />개</label>
												</div>
												<button class="btn" data-earn-idx={i} data-craft-idx={x} on:click={removeRecipeItem}><i class="icon ic16 icon-del" />삭제</button>
											</li>
										{/each}
										<li>
											<button on:click={addRecipeItem} data-earn-idx={i} class="plusBtn">+</button>
										</li>
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
				<div class="inputWrap usages">
					<div class="inputTitle">제작가능 아이템</div>
					<div>
						<ItemSearch bind:popupItem={editItem} inputWidth="100" ignoreImg={true} />
						<ul>
							{#each editItem.Usages as usage}
								<li class="miniItemLabel">
									<img class={'miniItem grade' + usage.grade} src={usage.imgUrl.replace('/images', '')} alt={usage.name} />
									<span class={'grade' + usage.grade}>{usage.name}</span>
									<button class="btn" data-url={usage.url} on:click={removeUsage}><i class="icon ic16 icon-del" />삭제</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}
		<div class="btnWrap">
			{#if clearItemClicked}
				<button class="btn btn-lg" on:click={resetItem}>뒤로 가기</button>
			{:else}
				<button class="btn btn-lg" on:click={clearItem}>새 아이템 생성</button>
			{/if}
			<button class="btn btn-lg" on:click={save}>저장하기</button>
		</div>
	</div>
</div>

<style>
	.layerPopup {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.dimmed {
		background: rgba(0, 0, 0, 0.5);
		width: 100%;
		height: 100%;
	}

	.box {
		position: absolute;
		background: white;
		border: 1px solid #333;
		border-radius: 15px;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		min-width: 200px;
		max-width: min(1024px, 90%);
		min-height: 400px;
		max-height: 90%;
		margin: auto;
		overflow: hidden;
	}

	.closeBtn {
		position: absolute;
		top: 5px;
		right: 10px;
		padding: 10px;
	}

	.popupTitle {
		font-size: 20px;
		font-weight: 800;
		line-height: 50px;
		margin-left: 20px;
	}

	.box-container {
		padding: 0 20px 20px;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		position: absolute;
		overflow: auto;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 50px 0;
	}

	.box-container > div {
		width: 100%;
	}

	.inline {
		display: inline;
	}

	@keyframes showAni {
		0% {
			opacity: 0;
			z-index: -1;
		}
		1% {
			z-index: 30000;
		}
		99% {
			opacity: 1;
		}
	}

	@keyframes hideAni {
		0% {
			opacity: 1;
			z-index: 30000;
		}
		99% {
			z-index: -1;
		}
	}
	:global(.inputTitle) {
		font-weight: bold;
	}
	.layerPopup textarea {
		width: calc(100% - 6px);
		height: 200px;
	}

	.inputWrap {
		margin-bottom: 10px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.inputWrap.crafts,
	.inputWrap.usages {
		align-items: start;
	}

	:global(.inputWrap div.inputTitle) {
		min-width: 15%;
	}

	.inputWrap.usages li {
		display: flex;
	}

	.btnWrap {
		display: flex;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 60px;
		background-color: #fff;
		justify-content: center;
	}
	.btnWrap button {
		margin: 10px;
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
	.miniItemLabel > button {
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
	ul {
		padding-left: 10px;
		width: 100%;
		box-sizing: border-box;
		flex: 1;
	}
	ul > li {
		margin-right: 10px;
	}
	.earnWrap {
		border: 1px solid var(--gray-color3);
		border-radius: 4px;
		background-color: var(--gray-color4);
		margin-bottom: 10px;
		padding: 5px 5px 10px 10px;
	}

	select {
		padding: 2px 6px;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
	}

	.plusBtn {
		padding: 10px;
		width: 10px;
		height: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		background-color: var(--gray-color);
		border: 1px solid var(--gray-color);
		border-radius: 50px;
		cursor: pointer;
	}

	.plusBtn:hover {
		border-color: var(--gray-color);
		background-color: #fff;
		color: var(--gray-color);
	}
</style>
