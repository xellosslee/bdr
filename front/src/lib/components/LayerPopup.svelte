<script>
	import { fade } from 'svelte/transition'
	import ImageSearch from '$components/ImageSearch.svelte'
	import ItemSearch from '$components/ItemSearch.svelte'
	import lib from '$lib'
	export let popupItem = {}
	let uploadImage = {} // 업로드 대상 이미지 값 저장용
	let dimmedClickClose = true
	let editItem = structuredClone(popupItem)
	export function closeEditLayer() {
		popupItem = null
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
		let result = await lib.api({ url: '/file/put', data })
		console.log(result)
		if (result.code == '00') {
			alert('업로드 성공')
		} else {
			alert(result.message)
		}
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
		let newUsages = editItem.Usages.filter((e) => e.resultItemCd != evt.target.dataset.itemCd)
		editItem.Usages = newUsages
	}
	function addEarn() {
		editItem.Earns.push({ type: 'get', Crafts: [] })
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
		let data = {
			itemIdEnc: editItem.itemIdEnc,
			itemCdEnc: editItem.itemCdEnc,
			...(editItem.name != popupItem.name ? { name: editItem.name } : {}),
			...(editItem?.itemImage?.fileId != null ? { fileId: editItem.itemImage.fileId } : {}),
			...(editItem.desc != popupItem.desc ? { desc: editItem.desc } : {}),
			...(editItem.grade != popupItem.grade ? { grade: editItem.grade } : {}),
			Earns: editItem.Earns.map((e) => ({ itemId: e.itemId, work: e.work, type: e.type, Crafts: e.Crafts.map((ee) => ({ itemCd: ee.itemCd, count: ee.count })) })),
			Usages: editItem.Usages.map((e) => ({ itemId: e.itemId, resultItemCd: e.resultItemCd })),
		}
		console.debug(data)
		let result = await lib.api({ url: '/item/put', data })
		if (result.code == '00') {
			alert('아이템이 등록 되었습니다.\n감사합니다.')
			closeEditLayer()
		}
	}
</script>

<div class="layerPopup" transition:fade={{ duration: 300 }}>
	<button class="dimmed" on:click={dimmedClick} aria-roledescription="close btn" />
	<div class="box">
		<div class="popupTitle">아이템 수정</div>
		<button class="closeBtn" on:click={closeEditLayer}><i class="icon ic16 icon-close" /></button>

		{#if editItem != null}
			<div class="box-container">
				<div class="inputWrap name">
					<div class="inputTitle">
						아이템명
						<input type="text" class="label" value={editItem['name']} />
						<select bind:value={editItem['grade']}>
							<option value="1">흰색</option>
							<option value="2">녹색</option>
							<option value="3">파란색</option>
							<option value="4">노란색</option>
							<option value="5">빨강색</option>
						</select>
					</div>
				</div>
				<ImageSearch bind:popupItem={editItem} />
				<div class="inputWrap imageUpload">
					<div class="inputTitle">
						이미지 파일 업로드<input type="file" on:change={setImageName} /><input type="text" value={uploadImage.name || ''} /><button on:click={doUpload}>doUpload</button>
					</div>
				</div>
				<div class="inputWrap desc">
					<div class="inputTitle">아이템 설명<textarea>{editItem.desc.replace(/<br>/gi, '\n')}</textarea></div>
				</div>
				<div class="inputWrap crafts">
					<div class="inputTitle">획득 방법<button on:click={addEarn}>추가</button></div>
					<ul>
						{#each editItem.Earns as earn, i}
							<li>
								<div>
									<select bind:value={earn.type}>
										<option value="get">획득/구매</option>
										<option value="craft">제작</option>
									</select>
									<input type="text" bind:value={earn.work} />
									{#if earn.type == 'get'}
										<input type="text" bind:value={earn.path} />
									{/if}
								</div>
								{#if earn.type == 'craft'}
									<ul class="row">
										{#each earn.Crafts as craft, x}
											<li class="col">
												아이템 <input type="text" class="count" bind:value={craft.itemCd} />
												개수 <input type="text" class="count" bind:value={craft.count} />
												<button class="btn" data-earn-idx={i} data-craft-idx={x} on:click={removeRecipeItem}><i class="icon ic16 icon-del" />삭제</button>
											</li>
										{/each}
										<li>
											<button on:click={addRecipeItem} data-earn-idx={i}>레시피 아이템 추가</button>
										</li>
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
				<div class="inputWrap usages">
					<div class="inputTitle">제작가능 아이템</div>
					<ItemSearch bind:popupItem={editItem} />
					<ul>
						{#each editItem.Usages as usage}
							<li class="miniItemLabel">
								<img
									class={'miniItem grade' + usage.usageItems[0].grade}
									src={usage.usageItems[0].itemImage && usage.usageItems[0].itemImage.imgUrl ? lib.apiUrl + usage.usageItems[0].itemImage.imgUrl : lib.apiUrl + usage.usageItems[0].imgUrl}
									alt={usage.usageItems[0].name}
								/>
								<span class={'grade' + usage.usageItems[0].grade}>{usage.usageItems[0].name}</span>
								<button class="btn" data-item-cd={usage.resultItemCd} on:click={removeUsage}><i class="icon ic16 icon-del" />삭제</button>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		<div class="btnWrap">
			<button class="btn" on:click={save}>저 장</button>
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

	.layerPopup textarea {
		width: calc(100% - 6px);
		height: 200px;
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
		height: 40px;
	}
	.btnWrap button {
		margin: 10px auto;
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
</style>
