import React, { useEffect, useState } from 'react'
import { DefaultProps } from '../../../interfaces/interfaces'
import addBudget from '../../../functions/database/addBudget';
import { useNavigate } from 'react-router-dom';
import deleteBudgetDB from '../../../functions/database/deleteBudgetDB';

/**
 * Form to edit the settings of a budget (e.g. its name).
 * @param props The BudgetProps (BP) element created in App.tsx.
 * @returns An "edit budget" form as a JSX element.
 */
function EditBudget(props : DefaultProps) {

	// Get props
	const {t, db, activeBudget, selectBudget} = props.bp;

	// Get useNavigate() from router so that we can go back to Settings page
	// later
	const navigate = useNavigate();

	// Create an object to hold form values
	const [values, setValues] = useState({
		name: activeBudget.name,
	} as {[key : string] : string});

	// State: Should we show the option to delete the budget?
	const [showDelete, setShowDelete] = useState(false);
	
	// If the script starts up without a budget (shouldn't be possible,
	// but ...), add budget name to form value when it updates
	useEffect(() => {
		const newValues = { ...values };
		newValues.name = activeBudget.name;
		setValues(newValues);
	}, [activeBudget]);

	/**
	 * Function that updates the form values when text inputs on the page
	 * are altered
	 * @param event The input field's onChange event
	 */
	const changeValues = (event : React.FormEvent<HTMLInputElement>) => {
		const newValues = { ...values };
		newValues[event.currentTarget.name] = event.currentTarget.value;
		setValues(newValues);
	}

	/**
	 * Function that runs when the form is submitted
	 * @param event The form onSubmit event
	 */
	const onSubmit = (event : React.FormEvent) => {
		// Stop default submit action
		event.preventDefault();

		// Abort if no budget name is given
		if (!values.name) {
			return;
		}

		// Create a new budget object
		const newBudget = { ...activeBudget };
		newBudget.name = values.name;
		newBudget.sync = 1;

		// Set that budget object as the active budget
		selectBudget(newBudget);

		// Update it in the database
		addBudget(db, newBudget)
		.then(() => {
			// Go back to the Settings screen
			navigate('/settings');
		});
	}

	/**
	 * Deletes the currently active budget from the database.
	 */
	const onDelete = () => {
		if (!activeBudget || !activeBudget.id) {
			return;
		}
		deleteBudgetDB(db, activeBudget.id)
		.then(() => {
			selectBudget(undefined);
			navigate('/');
		});

	}

	// Output the edit form
	return (
		<main className="subsettings">
			<h2 className="main-heading">{t.editCurrentBudget}</h2>
			<form onSubmit={(event) => onSubmit(event)}>
				<p><label htmlFor="budgetName">{t.budgetName}</label></p>
				<input type="text" id="budgetName" name="name" value={values.name} onChange={(event) => changeValues(event)} required />
				<button type="submit" className="button">{t.saveSettings}</button>
			</form>
			{showDelete
			?
			<div>
				<h3>{t.deleteBudget}</h3>
				<p>{t.deleteBudgetAreYouSure}</p>
				<button className="button delete" onClick={() => onDelete()}>{t.deleteBudgetConfirm}</button>
				<button className="button" onClick={() => setShowDelete(false)}>{t.deleteBudgetAbort}</button>
			</div>
			: <button className="button delete" onClick={() => setShowDelete(true)}>{t.deleteBudget}</button>}
		</main>
	)
}

export default EditBudget;