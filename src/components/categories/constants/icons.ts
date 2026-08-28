import type { LucideIcon } from 'lucide-react'

import {
	BriefcaseIcon,
	CarIcon,
	CoffeeIcon,
	FilmIcon,
	GiftIcon,
	GraduationCapIcon,
	HeartPulseIcon,
	HomeIcon,
	PlaneIcon,
	RepeatIcon,
	ShoppingBagIcon,
	ShoppingCartIcon,
	TagIcon,
	UtensilsIcon,
	WalletIcon,
	ZapIcon,
} from 'lucide-react'

import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

export const CATEGORY_ICON_COMPONENTS: Record<CATEGORY_ICON, LucideIcon> = {
	[CATEGORY_ICON.SHOPPING_CART]: ShoppingCartIcon,
	[CATEGORY_ICON.HOME]: HomeIcon,
	[CATEGORY_ICON.ZAP]: ZapIcon,
	[CATEGORY_ICON.CAR]: CarIcon,
	[CATEGORY_ICON.UTENSILS]: UtensilsIcon,
	[CATEGORY_ICON.FILM]: FilmIcon,
	[CATEGORY_ICON.HEART_PULSE]: HeartPulseIcon,
	[CATEGORY_ICON.SHOPPING_BAG]: ShoppingBagIcon,
	[CATEGORY_ICON.REPEAT]: RepeatIcon,
	[CATEGORY_ICON.WALLET]: WalletIcon,
	[CATEGORY_ICON.PLANE]: PlaneIcon,
	[CATEGORY_ICON.GRADUATION_CAP]: GraduationCapIcon,
	[CATEGORY_ICON.GIFT]: GiftIcon,
	[CATEGORY_ICON.BRIEFCASE]: BriefcaseIcon,
	[CATEGORY_ICON.COFFEE]: CoffeeIcon,
	[CATEGORY_ICON.TAG]: TagIcon,
}
