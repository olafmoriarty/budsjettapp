import React, {useState} from 'react';
import addAccount from '../../functions/database/addAccount';
import { Account, DefaultProps } from '../../interfaces/interfaces';

function AddAccount(props : DefaultProps) {
	const [values, setValues] = useState({} as {[key : string] : string});
	const {db, t, selectAccount, accounts, setAccounts, dialogBox, activeBudget} = props.bp;

	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	const submit = (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
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
			dialogBox.current?.close();
		});
	}

	return (
		<form className="dialog-form" onSubmit={(event) => submit(event)}>
			<h2>{t.addAccount}</h2>
			<p><label htmlFor="accountName">{t.nameOfAccount}</label></p>
			<input type="text" name="accountName" id="accountName" placeholder={t.accountNamePlaceholder} value={values.accountName === undefined ? '' : values.accountName} onChange={(event) => changeValues(event)} required />
			<button className="button" type="submit">{t.createAccount}</button>
		</form>
	)
}

export default AddAccount;