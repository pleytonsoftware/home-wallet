/**
 * A fixed, curated set of icons for categories — a closed enum of string keys (not freeform icon
 * names), so every stored value is guaranteed to map to a real icon.
 */
export enum CATEGORY_ICON {
	SHOPPING_CART = 'shopping-cart',
	HOME = 'home',
	ZAP = 'zap',
	CAR = 'car',
	UTENSILS = 'utensils',
	FILM = 'film',
	HEART_PULSE = 'heart-pulse',
	SHOPPING_BAG = 'shopping-bag',
	REPEAT = 'repeat',
	WALLET = 'wallet',
	PLANE = 'plane',
	GRADUATION_CAP = 'graduation-cap',
	GIFT = 'gift',
	BRIEFCASE = 'briefcase',
	COFFEE = 'coffee',
	/** Default fallback for uncategorized/legacy rows. */
	TAG = 'tag',
}
