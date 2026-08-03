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
	 * Credit card account type represents a credit card account.
	 * It is used for managing and tracking transactions made using a credit card.
	 */
	CREDIT_CARD = 'credit_card',

	/**
	 * Debit card account type represents a debit card account.
	 * It is used for managing and tracking transactions made using a debit card.
	 */
	DEBIT_CARD = 'debit_card',

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
