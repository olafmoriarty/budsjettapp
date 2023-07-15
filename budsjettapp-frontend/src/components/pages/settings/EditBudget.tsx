import React, { useEffect, useState } from 'react'
import { DefaultProps } from '../../../interfaces/interfaces'
import addBudget from '../../../functions/database/addBudget';
import { useNavigate } from 'react-router-dom';

/**
 * Form to edit the settings of a budget (e.g. its name).
 * @param props The BudgetProps (BP) element created in App.tsx.
 * @returns An "edit budget" form as a JSX element.
 */
function EditBudget(props : DefaultProps) {
	const {t, db, activeBudget, selectBudget} = props.bp;

	const navigate = useNavigate();

	const [values, setValues] = useState({
		name: activeBudget.name,
	} as {[key : string] : string});

	useEffect(() => {
		const newValues = { ...values };
		newValues.name = activeBudget.name;
		setValues(newValues);
	}, [activeBudget]);

	const changeValues = (event : React.FormEvent<HTMLInputElement>) => {
		const newValues = { ...values };
		newValues[event.currentTarget.name] = event.currentTarget.value;
		setValues(newValues);
	}

	const onSubmit = (event : React.FormEvent) => {
		event.preventDefault();

		if (!values.name) {
			return;
		}

		const newBudget = { ...activeBudget };
		newBudget.name = values.name;
		newBudget.synced = false;
		selectBudget(newBudget);
		addBudget(db, newBudget);
		navigate('/settings');
	}

	return (
		<main className="subsettings">
			<h2 className="main-heading">{t.editCurrentBudget}</h2>
			<form onSubmit={(event) => onSubmit(event)}>
				<p><label>{t.budgetName}</label></p>
				<input type="text" name="name" value={values.name} onChange={(event) => changeValues(event)} required />
				<button type="submit" className="button">{t.saveSettings}</button>
			</form>
		</main>
	)
}

export default EditBudget;