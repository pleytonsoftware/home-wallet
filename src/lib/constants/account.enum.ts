/**
 * Financial Account types enumeration
 */
export enum ACCOUNT_TYPE {
	/**
	 * Bank account type represents a traditional bank account, such as checking or savings.
	 * It is used for managing and tracking financial transactions that occur through a bank.
	 */
	BANK = 'bank',

	/**
	 * Card account type represents a credit or debit card account.
	 * It is used for managing and tracking transactions made using a card.
	 */
	CARD = 'card',

	/**
	 * Cash account type represents physical cash that is held by the user.
	 * It is used for managing and tracking cash transactions.
	 */
	CASH = 'cash',

	/**
	 * Other account type represents any other type of financial account that does not fall into the categories of bank, card, or cash.
	 */
	OTHER = 'other',
}
