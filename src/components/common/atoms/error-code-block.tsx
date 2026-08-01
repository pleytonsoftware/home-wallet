import { cn } from '@cn'

interface ErrorCodeBlockProps {
	children: React.ReactNode
	className?: string
}

export function ErrorCodeBlock({ children, className }: ErrorCodeBlockProps) {
	return (
		<pre
			className={cn(
				'max-h-80 overflow-auto text-left rounded-md border border-destructive/20 bg-destructive/5 p-4 font-mono text-sm whitespace-pre-wrap wrap-break-word',
				className,
			)}
		>
			<code>{children}</code>
		</pre>
	)
}
