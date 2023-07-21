import React, {useState} from 'react';
import addBudget from '../../functions/database/addBudget';
import { BP, Budget, DefaultProps } from '../../interfaces/interfaces';
import { useNavigate } from 'react-router-dom';

function AddBudget(props : Props) {
	const [values, setValues] = useState({} as {[key : string] : string});
	const {db, t, selectBudget, dialogBox} = props.bp;
	const {setCloseDialog} = props;

	const navigate = useNavigate();

	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	const submit = (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
		let newBudget = {
			name: values.budgetName,
			sync: 1,
		} as Budget;
		addBudget(db, newBudget)
		.then((budgetId) => {
			newBudget.id = budgetId;
			selectBudget(newBudget);
			setCloseDialog(true);
			navigate('/');
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

interface Props {
	bp : BP,
	setCloseDialog : (a : boolean) => void,
}

export default AddBudget