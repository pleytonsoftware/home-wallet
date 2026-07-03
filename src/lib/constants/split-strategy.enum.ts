export enum SplitStrategy {
	/**
	 * Split the expense equally among all members
	 */
	EQUAL = 'equal',

	/**
	 * Split the expense proportionally to each member's income
	 */
	PROPORTIONAL_TO_INCOME = 'proportional_to_income',

	/**
	 * Split the expense based on custom percentages defined by the user
	 */
	CUSTOM_PERCENTAGES = 'custom_percentages',

	/**
	 * Split the expense in a round-robin fashion, assigning each member a turn to pay
	 */
	ROUND_ROBIN = 'round_robin',

	/**
	 * Split the expense based on custom amounts defined by the user
	 */
	CUSTOM_AMOUNTS = 'custom_amounts',
}
