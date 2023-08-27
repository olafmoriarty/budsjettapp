import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Payee, Account } from '../../../interfaces/interfaces';
import {utils, writeFile} from 'xlsx';
import getTransactionsDB from '../../../functions/database/getTransactionsDB';
import getAllDB from '../../../functions/database/getAllDB';
import downloadTextFile from '../../../functions/downloadTextFile';
import { useBudget } from '../../../contexts/BudgetContext';

/**
 * Form to download an export file of the current budget.
 * @returns A form that lets the user export the budget in JSON or Excel format.
 */
function ExportBudget() {

	// Get variables from context.
	const {t, db, accounts, categories, payees, activeBudget} = useBudget();

	// State to save whether the user has picked JSON or Excel.
	const [format, setFormat] = useState(undefined as 'json' | 'excel' | undefined);

	// Get useNavigate() from router to change the page's URL.
	const navigate = useNavigate();

	// If no active budget is set, do nothing
	if (!activeBudget || !activeBudget.id) {
		return null;
	}

	// Create objects to easily index categories, payees and counteraccounts
	// by ID.
	const categoriesById = categories.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Category});
	categoriesById[0] = {budgetId: activeBudget.id || 0, name: t.income};

	const payeesById = payees.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Payee});

	const accountsById = accounts.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Account});

	/**
	 * Check if a format is given and run the export function.
	 * @param event The form onSubmit event.
	 */
	const onSubmit = (event : React.FormEvent) => {

		// Prevent default submit functionality.
		event.preventDefault();

		// Abort function if no format is given
		if (!format) {
			return;
		}
		runExport(format);
	}

	/**
	 * Create a downloadable export file.
	 * @param format The format of the export file, "excel" or "json"
	 */
	const runExport = async (format : 'excel' | 'json') => {

		// Abort if we don't have a budget number
		if (!activeBudget.id) {
			return;
		}
		// Get an array of all transactions
		let transactions = await getTransactionsDB(db, activeBudget.id, {}) || [];

		// Create an Excel file using Sheets.js
		if (format === 'excel') {
			
			// Create new workbook
			const workbook = utils.book_new();

			// Generate a worksheet for each account
			accounts.forEach((a) => {

				// Get all transactions for current account,
				const rows = transactions
				.filter(t => t.accountId === a.id)

				// sort them by date,
				.sort((a, b) => {
					if (a.date < b.date) {
						return -1;
					}
					if (a.date > b.date) {
						return 1;
					}
					if ((a.id || 0) < (b.id || 0)) {
						return -1;
					}
					if ((a.id || 0) > (b.id || 0)) {
						return 1;
					}
					return 0;
				})

				// and map them to a format suitable for export to a
				// spreadsheet.
				.map(t => { 
					return {
						date: t.date,
						payee: t.counterAccount ? accountsById[t.counterAccount].name : (t.payeeId ? payeesById[t.payeeId].name : ''),
						category: t.categoryId !== undefined ? categoriesById[t.categoryId].name : '',
						memo: t.memo || '',
						in: t.in,
						out: t.out,
					}
				})

				// Generate worksheet from object array.
				const worksheet = utils.json_to_sheet(rows);

				// Add column headers to worksheet.
				utils.sheet_add_aoa(worksheet, [[ t.date, t.payee, t.category, t.memo, t.in, t.out ]], { origin: 'A1' });

				// Add worksheet to workbook.
				utils.book_append_sheet(workbook, worksheet, a.name);
			});

			// Let user download workbook.
			writeFile(workbook, 'Budsjett.xlsx');

			// Navigate back to settings page.
			navigate('/settings');
		}

		// Create a JSON object and download it
		if (format === 'json') {

			// Get all data from database
			const allData = await getAllDB(db, activeBudget.id);

			// Stringify it
			const allDataString = JSON.stringify(allData);

			// Download it
			downloadTextFile(allDataString, 'Budget.json', 'json');

			// Navigate back to settings page
			navigate('/settings');
		}
	}

	// Output the form.
	return (
		<main className="subsettings">
			<form onSubmit={(event) => onSubmit(event)}>
			<h2 className="main-heading">{t.exportBudget}</h2>
			<h3>{t.exportFormat}</h3>
			<p><input 
				name="format" 
				value="excel" 
				id="excel" 
				type="radio"
				checked={format === 'excel'}
				onChange={() => setFormat('excel')}
				/> <label htmlFor="excel">{t.exportFormatExcel}</label></p>
			<p className="format-explanation">{t.exportFormatExcelLabel}</p>
			<p><input 
				name="format"
				value="json" 
				id="json" 
				type="radio"
				checked={format === 'json'}
				onChange={() => setFormat('json')}
				/> <label htmlFor="json">{t.exportFormatJson}</label></p>
			<p className="format-explanation">{t.exportFormatJsonLabel}</p>
			<button className="button" type="submit">{t.downloadBudget}</button>
			</form>
		</main>
	)
}

export default ExportBudget;