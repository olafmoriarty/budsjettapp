import React, {useState, useEffect} from 'react';
import addAccount from '../../functions/database/addAccount';
import { Account, DefaultProps } from '../../interfaces/interfaces';
import NumberInput from '../NumberInput';
import yyyymmdd from '../../functions/yyyymmdd';
import addTransactionDB from '../../functions/database/addTransactionDB';
import getMonth from '../../functions/getMonth';

function AddAccount(props : DefaultProps) {
	const [values, setValues] = useState({} as {[key : string] : string});
	const [accountBalance, setAccountBalance] = useState(0);
	const {db, t, selectAccount, accounts, setAccounts, dialogBox, activeBudget, accountBalances, setAccountBalances} = props.bp;

	useEffect(() => {
		const newValues = {...values};
		const d = new Date();
		newValues.accountBalanceDate = yyyymmdd(d);
		setValues(newValues);
	}, []);

	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	const submit = (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
		console.log(values.accountBalanceDate);
		if (!/^\d{4}\-\d{2}\-\d{2}$/.test(values.accountBalanceDate)) {
			console.log('Datofeil');
			return;
		}
		const month = getMonth(values.accountBalanceDate);
		let newAccount = {
			name: values.accountName,
			budgetId: activeBudget.id,
		} as Account;
		addAccount(db, newAccount)
		.then((accountId) => {
			newAccount.id = accountId;
			selectAccount(newAccount);
			const newAccountList = [ ...accounts, newAccount ];
			setAccounts(newAccountList);
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
				const newAccountBalances = { ...accountBalances };
				newAccountBalances[accountId || 0] = accountBalance;
				setAccountBalances(newAccountBalances);
				dialogBox.current?.close();
			})
		});
	}

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