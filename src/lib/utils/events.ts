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
