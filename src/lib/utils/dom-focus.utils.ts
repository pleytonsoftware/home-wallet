export const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Visible, tab-reachable descendants of `container`, in DOM (tab) order. */
export const getFocusableElements = (container: ParentNode): Array<HTMLElement> =>
	Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null)

/** Whether `element` is the last tab-reachable descendant of `container` — e.g. "is focus at the end of this row?" */
export const isLastFocusable = (container: ParentNode, element: Element | null): boolean => {
	const focusable = getFocusableElements(container)
	return focusable.length > 0 && focusable[focusable.length - 1] === element
}

/** Moves focus to the next tab-reachable descendant of `container` after `current`. Returns whether it found one. */
export const focusNext = (container: ParentNode, current: Element | null): boolean => {
	const focusable = getFocusableElements(container)
	const index = current ? focusable.indexOf(current as HTMLElement) : -1
	const next = focusable[index + 1]
	if (!next) return false
	next.focus()
	return true
}

const FLOATING_CONTENT_SELECTOR = '[data-slot="combobox-content"], [data-slot="popover-content"], [data-slot="dropdown-menu-content"]'

/**
 * Whether `target` sits inside a portalled combobox/popover/dropdown-menu popup. React's synthetic
 * events still bubble through a component's own `onKeyDown` even when the popup itself is portalled
 * elsewhere in the DOM — this lets a row-level shortcut handler ignore keystrokes that a nested popup
 * (which may not call `preventDefault()`) is already handling itself, e.g. Enter to select an item.
 */
export const isEventFromFloatingContent = (target: EventTarget | null): boolean =>
	target instanceof Element && !!target.closest(FLOATING_CONTENT_SELECTOR)
