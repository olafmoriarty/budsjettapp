import React, { useState } from 'react'
import { Account, BP } from '../../interfaces/interfaces'
import addAccount from '../../functions/database/addAccount';

/**
 * Content of the modal window used to edit the settings of an account.
 * @param props.bp - The 
 * @param props.setCloseDialog - The function that closes the dialog window.
 * @returns The "Account settings" form.
 */
function EditAccount(props : Props) {
	// Get variables from props
	const {account, setCloseDialog} = props;
	const {db, t, accounts, setAccounts} = props.bp;

	// Save form values to state
	const [values, setValues] = useState({
		'name' : account?.name || '',
	} as { [key : string] : string });

	// If no account is given, show nothing
	if (!account) {
		return null;
	}

	/**
	 * Update state with value of input field
	 * @param event - The onChange event.
	 */
	const changeValues = (event : React.FormEvent<HTMLInputElement>) => {
		let newValues = { ...values };
		newValues[event.currentTarget.name] = event.currentTarget.value;
		setValues(newValues);
	}

	/**
	 * Updates the account data and closes dialog when the form is submitted.
	 * @param event - The onSubmit event from the form.
	 */
	const onSubmit = (event : React.FormEvent<HTMLFormElement>) => {
		// Abort default submit
		event.preventDefault();

		// Abort process if no account name is given.
		if (!values.name) {
			return;
		}
		
		// Create an account object with the new account name.
		let newAccount = { ...account };
		newAccount.name = values.name;
		newAccount.sync = 1;

		// Add account to database.
		addAccount(db, newAccount)
		.then(() => {
			// Update the accounts list in memory with the new account.
			let allAccounts = accounts.map(el => el.id === newAccount.id ? newAccount : el);
			setAccounts(allAccounts);

			// Close dialog box.
			setCloseDialog(true);
		});
	}

	// Output Account settings form.
	return (
		<div>
			<form className="dialog-form" onSubmit={(event) => onSubmit(event)}>
				<h2>{t.accountSettings}</h2>
				<p><label htmlFor='accountName'>{t.nameOfAccount}</label></p>
				<input type="text" name="name" id="accountName" value={values.name} onChange={(event) => changeValues(event)} required />
				<button className="button" type="submit">{t.saveChanges}</button>
			</form>
		</div>
	)
}

interface Props {
	bp : BP,
	setCloseDialog : (a : boolean) => void,
	account : Account | undefined,
}
export default EditAccount