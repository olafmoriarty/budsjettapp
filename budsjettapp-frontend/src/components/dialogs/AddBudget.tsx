import React, {useState} from 'react';
import addBudget from '../../functions/database/addBudget';
import { Budget, Category } from '../../interfaces/interfaces';
import { useNavigate } from 'react-router-dom';
import addCategory from '../../functions/database/addCategory';
import { useBudget } from '../../contexts/BudgetContext';

function AddBudget(props : Props) {
	const [values, setValues] = useState({} as {[key : string] : string});
	const [template, setTemplate] = useState(0);
	const {db, t, selectBudget, dialogBox} = useBudget();
	const {setCloseDialog} = props;

	const navigate = useNavigate();

	// Get app language
	const lang = 'nn';

	// Fetch language files
	const templates = require(`../../languages/${lang}-templates.json`) as Template[];

	

	const changeValues = (ev : React.FormEvent<HTMLInputElement>) => {
		let newValues = {...values};
		newValues[ev.currentTarget.name] = ev.currentTarget.value;
		setValues(newValues)
	}

	const submit = async (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
		let newBudget = {
			name: values.budgetName,
			sync: 1,
		} as Budget;
		const budgetId = await addBudget(db, newBudget)
		newBudget.id = budgetId;
		if (template) {
			const categories = templates[template - 1].categories;
			for (let i = 0; i < categories.length; i++) {
				const newMasterCategory = {
					budgetId: budgetId,
					name: categories[i][0],
					sort: i + 1,
					sync: 1,
				} as Category;
				const masterCategoryId = await addCategory(db, newMasterCategory);
				for (let j = 1; j < categories[i].length; j++) {
					const newSubCategory = {
						budgetId: budgetId,
						name: categories[i][j],
						sort: j,
						sync: 1,
						parent: masterCategoryId,
					} as Category;
					await addCategory(db, newSubCategory);
				}
			}
		}
		selectBudget(newBudget);
		setCloseDialog(true);
		navigate('/');
	}

	return (
		<form className="dialog-form" onSubmit={(event) => submit(event)}>
			<h2>{t.newBudget}</h2>
			<p><label htmlFor="budgetName">{t.nameTheBudget}</label></p>
			<input type="text" name="budgetName" id="budgetName" placeholder={t.namePlaceholder} value={values.budgetName === undefined ? '' : values.budgetName} onChange={(event) => changeValues(event)} required />
			<p>{t.templateLabel}</p>
			{templates.map((el, index) => <p key={index + 1}><label><input type="radio" name="template" value={index + 1} checked={template === index + 1} onChange={() => setTemplate(index + 1)} /> {el.name}</label></p>)}
			<p><label><input type="radio" name="template" value={0} checked={template === 0} onChange={() => setTemplate(0)} /> {t.noTemplateEmptyBudget}</label></p>
			<button className="button" type="submit">{t.createBudget}</button>
		</form>
	)
}

interface Props {
	setCloseDialog : (a : boolean) => void,
}

interface Template {
	name : string,
	categories : string[][],
}

export default AddBudget;