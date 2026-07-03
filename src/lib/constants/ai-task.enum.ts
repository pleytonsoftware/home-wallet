/**
 * AI_TASK enum defines the different AI tasks that can be performed in the application.
 * Each task represents a specific functionality that the AI system can execute, such as predicting future budgets, etc...
 */
export enum AI_TASK {
	/**
	 * PREDICT_NEXT_MONTH task is responsible for analyzing historical financial data and predicting the budget for the next month.
	 */
	PREDICT_NEXT_MONTH = 'predict_next_month',

	/**
	 * SUMMARIZE_CURRENT task is responsible for summarizing the current financial status, providing insights into spending patterns, and highlighting key financial metrics.
	 */
	SUMMARIZE_CURRENT = 'summarize_current',

	/**
	 * SUGGEST_OPTIMIZATIONS task is responsible for analyzing the current financial data and suggesting optimizations to improve budgeting, reduce expenses, or increase savings.
	 */
	SUGGEST_OPTIMIZATIONS = 'suggest_optimizations',

	/**
	 * DRAFT_BUDGET_FROM_HISTORY task is responsible for creating a draft budget based on historical financial data, allowing users to quickly set up a budget using past trends.
	 */
	DRAFT_BUDGET_FROM_HISTORY = 'draft_budget_from_history',

	/**
	 * AUTO_CATEGORIZE task is responsible for automatically categorizing financial transactions based on predefined rules or machine learning algorithms, helping users organize their finances more efficiently.
	 */
	AUTO_CATEGORIZE = 'auto_categorize',

	/**
	 * PARSE_TICKET task is responsible for parsing financial tickets or receipts, extracting relevant information such as amounts, dates, and categories, and integrating this data into the user's financial records.
	 */
	PARSE_TICKET = 'parse_ticket',
}
