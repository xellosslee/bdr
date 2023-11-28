<script>
	import lib from '$lib'
	export let item = {}
	export let popupItem = null
	function openEditLayer(evt) {
		popupItem = item
	}
</script>

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

<style>
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
</style>
