<script>
	import lib from '$lib'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import LayerPopup from '$components/LayerPopup.svelte'
	import Item from '$components/Item.svelte'
	import HeaderSearchBox from '$components/HeaderSearchBox.svelte'
	export let data
	let popupItem = null // 열려있는 팝업의 아이템 정보
	let floatingStat = false
	let floatingContent = [
		['종류', '흰', '녹', '파'],
		['꽃', '1', '4', '9'],
		['곡물', '1', '3', '6'],
		['채소', '1', '2', '8'],
		['과일', '1', '4', '9'],
		['벌꿀', '1', '2', '3'],
		['물고기', '0.5', '1', '2'],
		['약초', '1', '3', '6'],
		['버섯', '1', '3', '5'],
	]
	function toggleFloating() {
		floatingStat = !floatingStat
	}
</script>

<HeaderSearchBox />
<div class="container">
	{#if data.items == null}
		<div class="content">로딩 중...</div>
	{:else if data.items.length == 0}
		<div class="content">아이템을 찾을 수 없습니다.</div>
	{:else}
		{#each data.items as item}
			<Item bind:item bind:popupItem />
		{/each}
	{/if}
</div>
{#if popupItem}
	<LayerPopup bind:popupItem />
{/if}
{#if floatingStat}
	<button class="floating fold" on:click={toggleFloating}></button>
{:else}
	<button class="floating" on:click={toggleFloating}>
		<table>
			<tr><th colspan="100%">재료개수 비율</th></tr>
			{#each floatingContent as row, r}
				<tr>
					{#each row as col}
						{#if r == 0}
							<th>{col}</th>
						{:else}
							<td>{col}</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</table>
	</button>
{/if}
<footer></footer>

<style>
	.container {
		margin: 20px auto;
		width: min(95%, 1024px);
		position: relative;
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
	.floating {
		position: fixed;
		width: 130px;
		height: 235px;
		background: white;
		right: 10px;
		bottom: 10px;
		border-radius: 4px;
		border: 1px solid #888;
	}
	.floating > table {
		width: 100%;
	}
	.floating.fold {
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}
</style>
