<script>
	import '$lib/css/default.css'
	import '$lib/css/icons.css'
	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			escape()
		}
	}
	function escape() {
		console.debug('닫기 수행')
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<slot />
