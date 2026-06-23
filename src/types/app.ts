export type LayoutProps<T = object> = {
	params: Promise<{ locale: string }>
} & Readonly<T>
