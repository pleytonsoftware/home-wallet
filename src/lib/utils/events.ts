/**
 * Wraps a React event handler so `event.preventDefault()` is called before it runs.
 *
 * @param handler - The event handler to invoke after preventing the event's default action.
 * @returns An event handler suitable for passing directly to a JSX event prop.
 * @example
 * <form onSubmit={pd(handleSubmit)} />
 */
export function pd<E extends React.SyntheticEvent>(handler: (event: E) => void) {
	return (event: E) => {
		event.preventDefault()
		handler(event)
	}
}

/**
 * Wraps a React event handler so `event.stopPropagation()` is called before it runs.
 *
 * @param handler - The event handler to invoke after stopping the event's propagation.
 * @returns An event handler suitable for passing directly to a JSX event prop.
 * @example
 * <div onClick={sp(handleClick)} />
 */
export function sp<E extends React.SyntheticEvent>(handler: (event: E) => void) {
	return (event: E) => {
		event.stopPropagation()
		handler(event)
	}
}

/**
 * Wraps a React event handler so both `event.preventDefault()` and `event.stopPropagation()` are called before it runs.
 *
 * @param handler - The event handler to invoke after preventing the event's default action and stopping its propagation.
 * @returns An event handler suitable for passing directly to a JSX event prop.
 * @example
 * <form onSubmit={psp(handleSubmit)} />
 */
export const psp = <E extends React.SyntheticEvent>(handler: (event: E) => void) => pd(sp(handler))
