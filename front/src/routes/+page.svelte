<script>
	import lib from '$lib'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import LayerPopup from '$components/LayerPopup.svelte'
	import Item from '$components/Item.svelte'
	import HeaderSearchBox from '$components/HeaderSearchBox.svelte'
	let items = null // 화면 랜딩된 아이템 전체 정보. Earns, Usages
	let popupItem = null // 열려있는 팝업의 아이템 정보
	onMount(async function () {
		let r = await lib.api({ url: '/items/get' })
		if (r.code == '00') {
			items = r.data
			console.log(items)
		}
	})
</script>

<HeaderSearchBox />
<div class="container">
	{#if items == null}
		<div class="content">로딩 중...</div>
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
	@media (max-width: 480px) {
		.container {
			margin: 20px 0;
			width: 100%;
		}
	}
</style>
