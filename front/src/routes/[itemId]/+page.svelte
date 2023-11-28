<script>
	import lib from '$lib'
	import logo from '$lib/img/blackSpirit.png'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import ImageSearch from '$components/ImageSearch.svelte'
	let items = null // 화면 랜딩된 아이템 전체 정보. Earns, Usages
	let popupItem = null // 열려있는 팝업의 아이템 정보
	let uploadImage = {} // 업로드 대상 이미지 값 저장용
	onMount(async function () {
		let res = await lib.api({ url: '/items/get/' + $page.params.itemId })
		let r = await res.json()
		if (r.code == '00') {
			items = r.data
			console.log(items)
			lib.bdrId = r.bdrId
		}
	})
	function openEditLayer(evt) {
		if (!evt.currentTarget.dataset.itemId) {
			return alert('화면이 정상적으로 로드 되지 않았습니다.\n새로 고침 후 진행해 주시기 바랍니다.[0001]')
		}
		let item = items.find((e) => e.itemIdEnc == evt.currentTarget.dataset.itemId)
		if (!item) {
			return alert('화면이 정상적으로 로드 되지 않았습니다.\n새로 고침 후 진행해 주시기 바랍니다.[0002]')
		}
		popupItem = item
	}
	function closeEditLayer() {
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
		let res = await lib.api({ url: '/file/put', data })
		let result = await res.json()
		console.log(result)
	}
	function setImageName(evt) {
		let image = evt.currentTarget
		if (image.files.length > 0) {
			uploadImage.name = image.files[0].name.split('.')[0].replace(/ /gi, '_')
			uploadImage.file = image.files[0]
		} else {
			uploadImage = {}
		}
	}
</script>

<header class="contentHeader">
	<a href="/"><div class="homeLink"><img src={logo} alt="흑정령(홈아이콘)" /></div></a>
	<div class="searchWrap">
		<input type="text" id="searchText" placeholder="파트너! 어서 궁금한 아이템명을 입력해봐!" spellcheck="false" />
		<div id="autoComplete" class="empty" />
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
<div class="container">
	{#if items == null}
		<div class="content">검색 중...</div>
	{:else if items.length == 0}
		<div class="content">아이템을 찾을 수 없습니다.</div>
	{:else}
		{#each items as item}
			<div class="content" data-item-id={item.itemIdEnc}>
				<div class="itemHeader">
					<div class="left">
						<div class="itemImg"><img src={item.itemImage && item.itemImage.imgUrl ? 'http://127.0.0.1:7700' + item.itemImage.imgUrl : ''} alt={item.name} /></div>
						<div class="itemName">{item.name}</div>
					</div>
					<div class="right">
						<div class="btnWrap">
							<button class="btn main" on:click={openEditLayer} data-item-id={item.itemIdEnc}><i class="icon ic16 icon-edit" /></button>
							<div class="likeWrap">
								<button class="btn solid success" data-value="1" data-item-id={item.itemIdEnc}>
									<i class="icon ic16 icon-like-fill" />
								</button>
								<div class="likeCnt" data-item-id={item.itemIdEnc}>{item.likeCount}</div>
								<button class="btn solid reverse" data-value="0" data-item-id={item.itemIdEnc}>
									<i class="icon ic16 icon-dislike-fill" />
								</button>
							</div>
							<button
								class="btn gold bookmark"
								onclick="bookmark(event)"
								data-img-url={item.itemImage && item.itemImage.imgUrl ? 'http://127.0.0.1:7700' + item.itemImage.imgUrl : ''}
								data-name={item.name}
								data-item-cd={item.itemCdEnc}
							>
								<i class="icon ic16 icon-bookmark" />
							</button>
						</div>
					</div>
				</div>
				<div class="itemDesc">{@html item.desc.replace('\n', '<br />')}</div>
				<hr class="separator" />
				<div class="subtitle">획득 방법</div>
				<div class="earnList">
					{#each item.Earns as earn, i}
						<div class="row">
							<div class="colHeader">
								{#if earn.type == 'craft'}
									<label>
										{#if earn.path != null}
											{earn.path}
										{/if}
										{earn.work}<br />
										<div>x <input type="text" class="count" data-earn-input={i} value="1" />회</div>
									</label>
								{:else}
									{earn.work}
								{/if}
							</div>
							<div class="row recipe">
								{#if earn.type != 'craft' && earn.path != null}
									{earn.path}
								{/if}
								{#each earn.Crafts as craft}
									{#if craft.craftItems && craft.craftItems.length > 0}
										<div class="col" style="align-items: center;">
											<div class="miniItemLabel" onclick="location.href='{craft.craftItems[0].url}'">
												<img
													class="miniItem"
													src={craft.craftItems[0].itemImage && craft.craftItems[0].itemImage.imgUrl ? 'http://127.0.0.1:7700' + craft.craftItems[0].itemImage.imgUrl : ''}
													alt={craft.craftItems[0].name}
												/>
												<span>{craft.craftItems[0].name}</span>
											</div>
											<div>{craft.count} x <input class="count" type="text" data-earn-id={i} data-ori-value={craft.count} readonly /></div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>
				{#if Array.isArray(item.Usages) && item.Usages.length > 0}
					<hr class="separator" />
					<div class="subtitle">{item.name} - 제작가능 아이템</div>
					<div class="usageList">
						{#each item.Usages as usage}
							{#if usage.usageItems && usage.usageItems.length > 0}
								<div class="miniItemLabel" onclick="location.href='{usage.usageItems[0].url}'">
									<img
										class="miniItem"
										src={usage.usageItems[0].itemImage && usage.usageItems[0].itemImage.imgUrl ? 'http://127.0.0.1:7700' + usage.usageItems[0].itemImage.imgUrl : ''}
										alt={usage.usageItems[0].name}
									/>
									<span>{usage.usageItems[0].name}</span>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>
{#if popupItem}
	<div class="layerPopup" transition:fade={{ duration: 300 }}>
		<div class="dimmed" />
		<div class="box">
			<button class="btn closeBtn" on:click={closeEditLayer}><i class="icon ic16 icon-close" /></button>
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
{/if}
<footer />

<style>
	@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css');

	:root {
		--text: #333;
		--point-color: indianred; /* 흑정령 눈색 */
		--success-color: rgb(0, 140, 255);
		--gold-color: rgb(255, 179, 0);
		--gray-color: #666;
		--gray-color1: #999;
		--gray-color2: #bbb;
		--gray-color3: #ddd;
		--gray-color3: #ddd;
		--gray-color4: #eeeeee;
	}

	body {
		font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic',
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
		font-size: min(16px, 4.10256vw);
		color: var(--text);
		margin: 0;
	}

	input:read-only {
		background-color: #eee;
	}

	div {
		line-height: min(26px, 6.6666667vw);
		color: var(--text);
	}

	a {
		text-decoration: unset;
		color: inherit;
	}

	li {
		list-style: none;
		color: var(--text);
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.row:not(:first-child) {
		margin-top: 4px;
	}

	.col {
		display: flex;
		flex-direction: column;
	}
	.col1 {
		width: 8.333333%;
	}
	.col3 {
		width: 25%;
	}
	.col6 {
		width: 50%;
	}
	.col12 {
		width: 100%;
	}
	@font-face {
		font-family: 'icon';
		src: url('$lib/fonts/icon.eot');
		src: url('$lib/fonts/icon.eot') format('embedded-opentype'), url('$lib/fonts/icon.ttf') format('truetype'), url('$lib/fonts/icon.woff') format('woff'), url('$lib/fonts/icon.svg') format('svg');
		font-weight: normal;
		font-style: normal;
		font-display: block;
	}

	[class^='icon-'],
	[class*=' icon-'] {
		/* use !important to prevent issues with browser extensions that change fonts */
		font-family: 'icon' !important;
		speak: never;
		font-style: normal;
		font-weight: normal;
		font-variant: normal;
		text-transform: none;
		line-height: 1;

		/* Better Font Rendering =========== */
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.ic16 {
		font-size: min(16px, 4.10256vw);
	}

	.icon-bookmark-fill:before {
		content: '\e900';
	}

	.icon-bookmark:before {
		content: '\e901';
	}

	.icon-dislike-fill:before {
		content: '\e902';
	}

	.icon-edit:before {
		content: '\e903';
	}

	.icon-like-fill:before {
		content: '\e904';
	}

	.icon-close:before {
		content: '\e905';
	}

	.icon-close-sm:before {
		content: '\e906';
	}

	input {
		font-family: pretendard, sans-serif;
		outline: none;
		color: var(--text);
		border: 1px solid var(--gray-color2);
		border-radius: 4px;
	}

	input.count {
		width: 64%;
		min-width: min(40px, 10.2564103vw);
		max-width: min(60px, 15.3846154vw);
		font-size: min(13px, 3.3333333vw);
		padding: 2px 4px;
		text-align: right;
	}

	.container {
		margin: 20px auto;
		width: min(95%, 1024px);
	}

	.content {
		margin-top: 20px;
		border: 1px solid var(--gray-color3);
		padding: min(30px, 7.6923077vw) min(20px, 5.1282051vw);
		border-radius: min(16px, 4.1025641vw);
		box-shadow: 5px 5px #888;
	}

	.content .itemDesc {
		max-height: 300px;
		overflow: auto;
	}

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
	.contentHeader .searchWrap > input[id='searchText'] {
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

	.itemHeader {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.itemHeader > div {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
	}

	.itemName {
		font-size: min(20px, 5.1282051vw);
		font-weight: 700;
	}

	.subtitle {
		font-size: min(18px, 4.6153846vw);
		font-weight: 700;
		margin: 8px 0 6px;
	}

	.itemImg {
		width: min(36px, 9.2307692vw);
		height: min(36px, 9.2307692vw);
		border: 1px solid var(--gray-color3);
		border-radius: 4px;
		overflow: hidden;
		margin-right: min(10px, 2.5641026vw);
	}

	.itemImg > img {
		width: 100%;
	}

	.earnList .colHeader {
		width: min(130px, 33.3333333vw);
		text-align: center;
		/* background-color: var(--gray-color3); */
		vertical-align: middle;
		font-size: min(13px, 3.3333333vw);
		font-weight: 600;
		border: 1px solid var(--gray-color1);
		border-radius: 5px;
		margin: 4px;
	}

	.earnList > .row {
		transition: background-color 0.2s;
	}

	.earnList > .row:hover {
		background-color: var(--gray-color4);
	}

	.earnList .recipe {
		width: 100%;
		flex-wrap: wrap;
		max-height: 200px;
		overflow: auto;
	}

	.earnList .recipe > .col {
		margin: auto;
	}

	img.miniItem {
		width: min(22px, 5.6410256vw);
		height: min(22px, 5.6410256vw);
		border: 1px solid var(--gray-color3);
		border-radius: 4px;
	}

	.usageList {
		display: flex;
		flex-wrap: wrap;
	}

	.usageList > div {
		margin-right: min(10px, 2.5641026vw);
		min-width: 22%;
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

	.btnWrap {
		display: flex;
	}

	.btnWrap > .btn:not(:first-child) {
		margin-left: 6px;
	}

	/* btn 기본 */
	.btn {
		display: flex;
		align-items: center;
		padding: min(4px, 1.025641vw) min(7px, 1.7948718vw);
		background: #fff;
		border: 1px solid var(--gray-color);
		color: var(--gray-color);
		border-radius: 4px;
		font-size: min(12px, 3.0769231vw);
		cursor: pointer;
	}
	.btn:hover {
		background: var(--gray-color);
		border-color: #fff;
		color: #fff;
	}

	.btn > svg.bi:not(:only-child) {
		margin-right: 4px;
	}

	.btn.reverse {
		background: var(--gray-color);
		border-color: var(--gray-color);
		color: #fff;
	}
	.btn.reverse:hover {
		background: #fff;
		border-color: var(--gray-color);
		color: var(--gray-color);
	}

	.btn.main {
		background: var(--point-color);
		border-color: var(--point-color);
		color: #fff;
	}
	.btn.main:hover {
		background: #fff;
		border-color: var(--point-color);
		color: var(--point-color);
	}

	.btn.success {
		background: var(--success-color);
		border-color: var(--success-color);
		color: #fff;
	}
	.btn.success:hover {
		background: #fff;
		border-color: var(--success-color);
		color: var(--success-color);
	}

	.btn.gold {
		background: var(--gold-color);
		border-color: var(--gold-color);
		color: #fff;
	}
	.btn.gold:hover {
		background: #fff;
		border-color: var(--gold-color);
		color: var(--gold-color);
	}

	.likeWrap {
		display: flex;
		border: 1px solid var(--gray-color2);
		border-radius: 4px;
		margin-left: min(6px, 1.5384615vw);
		align-items: center;
	}

	.likeWrap .likeCnt {
		font-size: min(12px, 3.0769231vw);
		color: var(--gray-color1);
		min-width: min(15px, 3.8461538vw);
		text-align: center;
	}

	.btn.solid {
		height: 20px;
		background: none;
		border: none;
		padding: 0;
		margin: 0 5px;
		transition: opacity 0.3s, transform 0.3s;
	}

	.btn.solid.success {
		color: var(--success-color);
	}

	.btn.solid.reverse {
		color: var(--gray-color);
	}

	button.btn.solid:hover,
	button.btn.solid:focus {
		opacity: 0.6;
	}

	button.btn.solid:active {
		transform: scale(1.2);
	}

	.contentHeader .searchWrap > div#toolBox {
		display: flex;
	}

	.contentHeader .searchWrap > div#toolBox > div {
		width: 100%;
		padding: 6px;
		font-weight: 600;
	}

	.layerPopup {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
	}

	.layerPopup .dimmed {
		background: rgba(0, 0, 0, 0.5);
		width: 100%;
		height: 100%;
	}

	.layerPopup .box {
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

	.layerPopup .closeBtn {
		position: absolute;
		top: 0;
		right: 0;
		width: 24px;
		height: 24px;
		padding: 10px;
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

	@media (max-width: 480px) {
		.container {
			margin: 20px 0;
			width: 100%;
		}
	}
</style>
