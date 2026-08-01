import '@testing-library/jest-dom'

// jsdom lacks ResizeObserver, which some UI libraries (e.g. @dnd-kit/dom) require at import time.
if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}
