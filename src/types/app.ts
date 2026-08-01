export type LayoutProps<T = object, P = object> = {
	params: Promise<{ locale: string } & P>
} & Readonly<T>

export type EmptyObject = Record<string, never>
