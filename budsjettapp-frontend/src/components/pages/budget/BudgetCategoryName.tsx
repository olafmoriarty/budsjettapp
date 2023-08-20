import React, {useState, useEffect} from 'react'
import { BBP, Category } from '../../../interfaces/interfaces';
import addCategory from '../../../functions/database/addCategory';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../../../contexts/BudgetContext';
import { useAPI } from '../../../contexts/APIContext';

const BudgetCategoryName = (props : CategoryNameProps) => {
	const bp = useBudget();
	const {syncBudget} = useAPI();
	const {id, name} = props.category;

	const [categoryName, setCategoryName] = useState(name);

	useEffect(() => {
		setCategoryName(name);
	}, [props.bbp.categoryToEdit]);

	const changeCategoryName = (event? : React.FormEvent<HTMLFormElement>) => {
		if (event) {
			event.preventDefault();
		}

		if (categoryName === name || categoryName === '') {
			if (categoryName === '') {
				setCategoryName(name);
			}
			props.bbp.setCategoryToEdit(undefined);
			return;
		}

		const newCategory = { ...props.category, name: categoryName, sync: 1, } as Category;
		addCategory(bp.db, newCategory)
		.then(el => {
			const newCategories = bp.categories.map(oldCategory => oldCategory.id === newCategory.id ? newCategory : oldCategory);
			bp.setCategories(newCategories);
			props.bbp.setCategoryToEdit(undefined);
			syncBudget();
		});
	}

	let nameBox = <button className="link hoverlink main-part-of-cell" onClick={() => props.bbp.setCategoryToEdit(id)}>{name}</button>;
	if (props.bbp.categoryToEdit === id) {
		nameBox = <form onSubmit={(event) => changeCategoryName(event)} className="main-part-of-cell">
			<input type="text" name="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} autoFocus onFocus={(event) => event.target.select()} onBlur={() => changeCategoryName()} />
		</form>
	}

	return <>
		{nameBox}
		<button className="edit-category-button" onClick={() => {
			bp.openDialog(['editCategory', { id: id }]);
		}}><FontAwesomeIcon icon={faGear} /></button>
	</>
}

interface CategoryNameProps {
	bbp: BBP,
	category : Category,
}


export default BudgetCategoryName