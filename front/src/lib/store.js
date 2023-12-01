import { writable } from 'svelte/store'

export const viewStack = writable([])

let viewStackList
viewStack.subscribe((value) => {
	viewStackList = value
})
/** 함수를 통해 ESC 키로 닫혀야 하는 레이어 팝업 창이 생성 되는 경우 "닫기 함수"를 파라미터로 호출한다. */
export function addViewStackByCloseFunction(closeFunc) {
	viewStack.set([...viewStackList, closeFunc])
}
/** 가장 최근의 "닫기 함수"를 가져온다. */
export function popCloseFunction() {
	if (viewStackList.length == 0) {
		return null
	}
	let closeFunc = viewStackList.pop()
	viewStack.set([...viewStackList])
	return closeFunc
}
