<script>
	import { fade } from 'svelte/transition'
	import ImageSearch from '$components/ImageSearch.svelte'
	export let popupItem = {}
	let uploadImage = {} // 업로드 대상 이미지 값 저장용
	let dimmedClickClose = true

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
</script>

<div class="layerPopup" transition:fade={{ duration: 300 }}>
	<button class="dimmed" on:click={dimmedClick} aria-roledescription="close btn" />
	<div class="box">
		<button class="closeBtn" on:click={closeEditLayer}><i class="icon ic16 icon-close" /></button>
		<div class="box-container">
			<div class="inputWrap name">
				<div class="inputTitle">아이템명 <input type="text" class="label" value={popupItem?.name} /></div>
			</div>
			<ImageSearch bind:popupItem />
			<div class="inputWrap imageUpload">
				<div class="inputTitle">
					이미지 파일 업로드<input type="file" on:change={setImageName} /><input type="text" value={uploadImage.name || ''} /><button on:click={doUpload}>doUpload</button>
				</div>
			</div>
			<div class="inputWrap desc">
				<div class="inputTitle">아이템 설명<textarea>{popupItem.desc.replace(/<br>/gi, '\n')}</textarea></div>
			</div>
			<div class="inputWrap crafts">
				<div class="inputTitle">획득 방법</div>
				<ul>
					<li>
						<div>동작 <input type="text" value="요리" /></div>
						<ul>
							<li>
								<div>아이템 <input type="text" /></div>
								<div>개수 <input type="text" /></div>
							</li>
							<li>
								<div>아이템 <input type="text" /></div>
								<div>개수 <input type="text" /></div>
							</li>
							<li>
								<div>아이템 <input type="text" /></div>
								<div>개수 <input type="text" /></div>
							</li>
							<li>
								<div>아이템 <input type="text" /></div>
								<div>개수 <input type="text" /></div>
							</li>
						</ul>
					</li>
				</ul>
			</div>
			<div class="inputWrap usages">
				<div class="inputTitle">제작가능 아이템<button class="btn"><i class="icon ic16 icon-add" />추가</button></div>
				<ul>
					<li>
						<div>아이템 선택</div>
						<button class="btn"><i class="icon ic16 icon-del" />삭제</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	.layerPopup {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
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
		top: 10px;
		right: 10px;
		padding: 10px;
	}

	.box-container {
		padding: 20px;
		display: flex;
		flex-wrap: wrap;
	}

	.box-container > div {
		flex: 1 0 auto;
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
</style>
