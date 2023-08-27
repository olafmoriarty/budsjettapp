import React, {useState, useEffect} from 'react';

import NumberInput from '../NumberInput';

import addAccount from '../../functions/database/addAccount';
import addTransactionDB from '../../functions/database/addTransactionDB';
import getMonth from '../../functions/getMonth';
import yyyymmdd from '../../functions/yyyymmdd';

import { Account, Category } from '../../interfaces/interfaces';
import { useBudget } from '../../contexts/BudgetContext';
import { useAPI } from '../../contexts/APIContext';
import addCategory from '../../functions/database/addCategory';

/**
 * Content of the modal window used to create a new account.
 * @param props The BudgetProps (BP) element created in App.tsx.
 * @returns The "Create new account" form.
 */
function AddAccount() {

	// State: object containing string values generated from form fields
	const [values, setValues] = useState({} as {[key : string] : string});

	// State: Account balance (floating number)
	const [accountBalance, setAccountBalance] = useState(0);

	// State: Is "create budget category" checked?
	const [createCategoryChecked, setCreateCategoryChecked] = useState(true);

	// Get contents of budget props
	const {db, t, selectAccount, accounts, setAccounts, dialogBox, activeBudget, accountBalances, setAccountBalances, categories, setCategories} = useBudget();
	const {syncBudget} = useAPI();
	// On mount ...
	useEffect(() => {
		// Set date field to today's date
		const newValues = {...values};
		const d = new Date();
		newValues.accountBalanceDate = yyyymmdd(d);
		setValues(newValues);
	}, []);

	/**
	 * Function which, when used in an input onChange attribute, updates the
	 * input value of the current form field
	 * @param ev The form event 
	 */
	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	/**
	 * Function which runs when the form is submitted 
	 * @param ev The form event
	 */
	const submit = async (ev : React.FormEvent<HTMLFormElement>) => {

		// Stop the form from actually submitting
		ev.preventDefault();

		// Check that the given date is a valid date
		if (!/^\d{4}-\d{2}-\d{2}$/.test(values.accountBalanceDate)) {
			return;
		}

		// Get the month number of given date
		const month = getMonth(values.accountBalanceDate);

		// Create account data
		let newAccount = {
			name: values.accountName,
			budgetId: activeBudget.id,
			sync: 1,
		} as Account;

		// Submit account to database
		const accountId = await addAccount(db, newAccount);
		newAccount.id = accountId;

		// Add account ID to account data
		selectAccount(newAccount);

		// Add account to account list
		const newAccountList = [ ...accounts, newAccount ];
		setAccounts(newAccountList);

		// If balance is negative and user wants to create a new category, do so
		let categoryId = 0 as number | undefined;
		if (accountBalance < 0 && createCategoryChecked) {
			// Get debt master category if it exists
			const masterCategoryArray = categories.filter(el => !el.parent && (el.isDebtCategory || (el.name === t.debtCategoryName)));
			let masterCategoryId : number | undefined;
			let newCategories = [ ...categories ];
			if (masterCategoryArray.length) {
				masterCategoryId = masterCategoryArray[0].id;
			}
			else {
				// Create master category
				const sort = categories.filter((el) => !el.parent).length + 1;

				let newCategory = {
					name: t.debtCategoryName, 
					budgetId: activeBudget.id,
					sort: sort,
					sync: 1,
					isDebtCategory: true,
				} as Category;
				masterCategoryId = await addCategory(db, newCategory);

				newCategory.id = masterCategoryId;

				newCategories.push(newCategory);
			}

			// Create debt category
			const sort = categories.filter((el) => el.parent === masterCategoryId).length + 1;

			let newCategory = {
				name: values.accountName,
				budgetId: activeBudget.id,
				parent: masterCategoryId,
				sort: sort,
				sync: 1,
			} as Category;
			categoryId = await addCategory(db, newCategory);
			newCategory.id = categoryId;
			newCategories.push(newCategory);

			setCategories(newCategories);
		}
		
		// Create incoming balance transaction and add it to the database
		await addTransactionDB(db, {
			budgetId: activeBudget.id || 0,
			accountId: accountId || 0,
			categoryId: categoryId,
			date: values.accountBalanceDate,
			month: month,
			memo: t.accountBalanceMemo,
			in: accountBalance > 0 ? accountBalance : 0,
			out: accountBalance < 0 ? 0 - accountBalance : 0,
			sync: 1,
		});

		await syncBudget();

		// Add new account to account balance list
		const newAccountBalances = { ...accountBalances };
		newAccountBalances[accountId || 0] = accountBalance;
		setAccountBalances(newAccountBalances);
		dialogBox.current?.close();
		
	}

	// Display the form to add a new account
	return (
		<form className="dialog-form" onSubmit={(event) => submit(event)}>
			<h2>{t.addAccount}</h2>
			<p><label htmlFor="accountName">{t.nameOfAccount}</label></p>
			<input type="text" name="accountName" id="accountName" placeholder={t.accountNamePlaceholder} value={values.accountName === undefined ? '' : values.accountName} onChange={(event) => changeValues(event)} required />
			<div className="accountBalanceSettings">
				<div>
					<p><label htmlFor="accountBalance">{t.accountBalance}</label></p>
					<NumberInput name="accountBalance" id="accountBalance" amount={accountBalance} setAmount={setAccountBalance}  />
				</div>
				<div>
					<p><label htmlFor="accountBalanceDate">{t.accountBalanceDate}</label></p>
					<input type="date" name="accountBalanceDate" id="accountBalanceDate" value={values.accountBalanceDate === undefined ? '' : values.accountBalanceDate} onChange={(event) => changeValues(event)} required />
				</div>
			</div>
			{accountBalance < 0 ? <p className="accountBalanceCreateCategoryCheckbox"><input type="checkbox" checked={createCategoryChecked} onChange={(event) => setCreateCategoryChecked( event.target.checked )} /> {t.createDebtCategory}</p> : undefined}
			<button className="button" type="submit">{t.createAccount}</button>
		</form>
	)
}

export default AddAccount;