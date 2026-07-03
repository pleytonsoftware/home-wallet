/**
 * Payment type enum
 * Represents the type of a payment, either an expense or an income.
 */
export enum PAYMENT_TYPE {
	/**
	 * Represents an expense payment type, indicating that money is being spent or deducted from an account.
	 */
	EXPENSE = 'expense',

	/**
	 * Represents an income payment type, indicating that money is being received or added to an account.
	 */
	INCOME = 'income',
}
