<script>
	import '$lib/css/default.css'
	import '$lib/css/icons.css'
	import { viewStack } from '$lib/store'

	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			escape()
		}
	}
	let viewStackList
	const unsubscribe = viewStack.subscribe((value) => {
		viewStackList = value
	})
	function escape() {
		console.debug('닫기 시도')
		if (!Array.isArray(viewStackList) || viewStackList.length == 0) {
			console.debug('닫을 창 없음')
			return
		}
		let lastView = viewStackList.pop()
		lastView()
		console.debug('닫기 완료')
		viewStack.set([...viewStackList])
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<slot />
