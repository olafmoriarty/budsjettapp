import React, {useState} from 'react';
import addBudget from '../../functions/database/addBudget';
import { Budget, DefaultProps } from '../../interfaces/interfaces';

function AddBudget(props : DefaultProps) {
	const [values, setValues] = useState({} as {[key : string] : string});
	const {db, t, selectBudget, dialogBox} = props.bp;

	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	const submit = (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
		let newBudget = {name: values.budgetName} as Budget;
		addBudget(db, newBudget)
		.then((budgetId) => {
			newBudget.id = budgetId;
			selectBudget(newBudget);
			dialogBox.current?.close();
		});
	}

	return (
		<form className="dialog-form" onSubmit={(event) => submit(event)}>
			<h2>{t.newBudget}</h2>
			<p><label htmlFor="budgetName">{t.nameTheBudget}</label></p>
			<input type="text" name="budgetName" id="budgetName" placeholder={t.namePlaceholder} value={values.budgetName === undefined ? '' : values.budgetName} onChange={(event) => changeValues(event)} required />
			<button className="button" type="submit">{t.createBudget}</button>
		</form>
	)
}

export default AddBudget