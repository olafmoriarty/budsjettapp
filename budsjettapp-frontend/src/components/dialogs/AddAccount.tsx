import React, {useState, useEffect} from 'react';

import NumberInput from '../NumberInput';

import addAccount from '../../functions/database/addAccount';
import addTransactionDB from '../../functions/database/addTransactionDB';
import getMonth from '../../functions/getMonth';
import yyyymmdd from '../../functions/yyyymmdd';

import { Account, DefaultProps } from '../../interfaces/interfaces';

/**
 * Content of the modal window used to create a new account.
 * @param props The BudgetProps (BP) element created in App.tsx.
 * @returns 
 */
function AddAccount(props : DefaultProps) {

	// State: object containing string values generated from form fields
	const [values, setValues] = useState({} as {[key : string] : string});

	// State: Account balance (floating number)
	const [accountBalance, setAccountBalance] = useState(0);

	// Get contents of budget props
	const {db, t, selectAccount, accounts, setAccounts, dialogBox, activeBudget, accountBalances, setAccountBalances} = props.bp;

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
	const submit = (ev : React.FormEvent<HTMLFormElement>) => {

		// Stop the form from actually submitting
		ev.preventDefault();

		// Check that the given date is a valid date
		if (!/^\d{4}\-\d{2}\-\d{2}$/.test(values.accountBalanceDate)) {
			return;
		}

		// Get the month number of given date
		const month = getMonth(values.accountBalanceDate);

		// Create account data
		let newAccount = {
			name: values.accountName,
			budgetId: activeBudget.id,
		} as Account;

		// Submit account to database
		addAccount(db, newAccount)
		.then((accountId) => {
			newAccount.id = accountId;

			// Add account ID to account data
			selectAccount(newAccount);

			// Add account to account list
			const newAccountList = [ ...accounts, newAccount ];
			setAccounts(newAccountList);

			// Create incoming balance transaction and add it to the database
			addTransactionDB(db, {
				budgetId: activeBudget.id || 0,
				accountId: accountId || 0,
				categoryId: 0,
				date: values.accountBalanceDate,
				month: month,
				memo: t.accountBalanceMemo,
				in: accountBalance > 0 ? accountBalance : 0,
				out: accountBalance < 0 ? 0 - accountBalance : 0,
			})
			.then (() => {
				// Add new account to account balance list
				const newAccountBalances = { ...accountBalances };
				newAccountBalances[accountId || 0] = accountBalance;
				setAccountBalances(newAccountBalances);
				dialogBox.current?.close();
			})
		});
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
					<NumberInput bp={props.bp} name="accountBalance" id="accountBalance" amount={accountBalance} setAmount={setAccountBalance}  />
				</div>				
				<div>
					<p><label htmlFor="accountBalanceDate">{t.accountBalanceDate}</label></p>
					<input type="date" name="accountBalanceDate" id="accountBalanceDate" value={values.accountBalanceDate === undefined ? '' : values.accountBalanceDate} onChange={(event) => changeValues(event)} required />
				</div>
			</div>
			<button className="button" type="submit">{t.createAccount}</button>
		</form>
	)
}

export default AddAccount;