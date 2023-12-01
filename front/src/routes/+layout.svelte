<script>
	import '$lib/css/default.css'
	import '$lib/css/icons.css'
	import { popCloseFunction } from '$lib/store'

	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			escape()
		}
	}
	function escape() {
		console.debug('닫기 시도')
		let closeFunc = popCloseFunction()
		if (closeFunc == null) {
			console.debug('닫을 창 없음')
			return
		}
		closeFunc()
		console.debug('닫기 완료')
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<slot />
