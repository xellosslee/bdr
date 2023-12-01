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
		<div>종류별 재료개수</div>
		<table>
			<tr>
				<th>종류</th>
				<th>흰</th>
				<th>녹</th>
				<th>파</th>
			</tr>
			<tr>
				<td>꽃</td>
				<td>1</td>
				<td>4</td>
				<td>9</td>
			</tr>
			<tr>
				<td>곡물</td>
				<td>1</td>
				<td>3</td>
				<td>6</td>
			</tr>
			<tr>
				<td>채소</td>
				<td>1</td>
				<td>2</td>
				<td>8</td>
			</tr>
			<tr>
				<td>과일</td>
				<td>1</td>
				<td>4</td>
				<td>9</td>
			</tr>
			<tr>
				<td>벌꿀</td>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
			<tr>
				<td>물고기</td>
				<td>0.5</td>
				<td>1</td>
				<td>2</td>
			</tr>
			<tr>
				<td>약초</td>
				<td>1</td>
				<td>3</td>
				<td>6</td>
			</tr>
			<tr>
				<td>버섯</td>
				<td>1</td>
				<td>3</td>
				<td>5</td>
			</tr>
		</table>
	</button>
{/if}
<footer></footer>

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
	.floating {
		position: fixed;
		width: 130px;
		height: 230px;
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
