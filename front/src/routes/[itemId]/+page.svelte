<script>
	import lib from '$lib'
	import logo from '$lib/img/blackSpirit.png'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import LayerPopup from '$components/LayerPopup.svelte'
	import Item from '$components/Item.svelte'
	let items = null // 화면 랜딩된 아이템 전체 정보. Earns, Usages
	let popupItem = null // 열려있는 팝업의 아이템 정보
	onMount(async function () {
		let res = await lib.api({ url: '/items/get/' + $page.params.itemId })
		let r = await res.json()
		if (r.code == '00') {
			items = r.data
			console.log(items)
			lib.bdrId = r.bdrId
		}
	})
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
			<Item bind:item bind:popupItem />
		{/each}
	{/if}
</div>
{#if popupItem}
	<LayerPopup bind:popupItem />
{/if}
<footer />

<style>
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

	.contentHeader .searchWrap > div#toolBox {
		display: flex;
	}

	.contentHeader .searchWrap > div#toolBox > div {
		width: 100%;
		padding: 6px;
		font-weight: 600;
	}

	@media (max-width: 480px) {
		.container {
			margin: 20px 0;
			width: 100%;
		}
	}
</style>
