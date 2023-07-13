import React, {useState, useEffect} from 'react'
import { BP, Category } from '../../interfaces/interfaces'
import Loading from '../Loading';
import getTransactionCountDB from '../../functions/database/getTransactionCountDB';
import sortBySort from '../../functions/sortBySort';
import deleteCategoryDB from '../../functions/database/deleteCategoryDB';
import addCategory from '../../functions/database/addCategory';
import moveCategory from '../../functions/moveCategory';

function EditCategory( props : EditCategoryProps ) {
	const {bp, setCloseDialog, id} = props;
	const {t, categories, setCategories} = props.bp;

	const [isLoading, setIsLoading] = useState(true);
	const [transactionCount, setTransactionCount] = useState(0);

	let category : Category | null;
	const categoryList = categories.filter((el) => el.id === id);
	if (categoryList.length) {
		category = categoryList[0];
	}
	else {
		category = null;
	}
	const children = categories.filter((el) => el.parent === id);

	const [nameInput, setNameInput] = useState('');
	const [parentInput, setParentInput] = useState(undefined as number | undefined);

	useEffect(() => {
		setIsLoading(true);
		getTransactionCountDB(bp.db, bp.activeBudget.id || 0, { category: id })
		.then(count => {
			setTransactionCount(count || 0);
			setIsLoading(false);
		});
		if (category) {
			setNameInput(category.name);
			setParentInput(category.parent);
		}
	}, [id]);

	const onSubmit = ( event? : React.FormEvent<HTMLFormElement>, mode? : string ) => {
		if (event) {
			event.preventDefault();
		}
		if (!category || !id) {
			return;
		}
		if (mode === 'delete' && !category.externalId) {
			deleteCategoryDB(bp.db, id)
			.then (() => {
				const newCategories = categories.filter(el => el.id !== id);
				setCategories(newCategories);
				setCloseDialog(true);
				return;
			});
		}
		else {
			let newCategory = { ...category };
			newCategory.name = nameInput;
			if (mode === 'hide') {
				newCategory.hidden = true;
			}
			if (mode === 'delete') {
				newCategory = { id: category.id, externalId: category.externalId, budgetId: category.budgetId, name: '', deleted: true, }
			}
			addCategory(bp.db, newCategory)
			.then(() => {
				if (category && (category.parent !== parentInput || mode === 'hide')) {
					moveCategory(bp, id, -1, mode === 'hide' ? category.parent : parentInput)
					.then(() => {
						if (mode === "hide") {
							newCategory.sort = categories.filter(el => el.parent === category?.parent).length;
							const newCategories = [ ...categories.filter((el) => el.id !== id), newCategory ];
							setCategories(newCategories);
						}
						setCloseDialog(true);
					});
				}
				else {
					const newCategories = [ ...categories.filter((el) => el.id !== id), newCategory ];
					setCategories(newCategories);
					setCloseDialog(true);
				}
			})
		}
	}

	if (!category) {
		return null;
	}

	return (
		<div>
			<form className="dialog-form" onSubmit={(event) => onSubmit(event)}>
			<h2>{t.editCategory}</h2>
			<p><label htmlFor="category-name">{t.categoryName}</label></p>
			<p><input id="category-name" name="categoryName" type="text" value={nameInput} onChange={(event) => setNameInput(event.target.value)} /></p>
			{category.parent ? <>
				<p><label htmlFor="parent-category">{t.parentCategory}</label></p>
				<p><select id="parent-category" name="parentCategory" value={parentInput} onChange={(event) => setParentInput(Number(event.target.value))}>
					{categories.filter(el => !el.parent).sort((a, b) => sortBySort(a, b)).map(el => <option value={el.id} key={el.id}>{el.name}</option>)}
				</select></p>
			</> : undefined}
			<p><button type="submit" className="button">{t.saveChanges}</button></p>
			</form>
			<div className="dialog-buttons">
				{category.hidden ? <button className="button" onClick={() => onSubmit(undefined, 'unhide')}>{t.showCategoryButton}</button> : <button className="button" onClick={() => onSubmit(undefined, 'hide')}>{t.hideCategoryButton}</button>}
				{children.length || isLoading || transactionCount ? undefined : <button className="button delete-button" onClick={() => onSubmit(undefined, 'delete')}>{t.deleteCategory}</button>}
				{children.length || isLoading || !transactionCount ? undefined : <button className="button delete-button">{t.deleteCategoryDotDotDot}</button>}
				{isLoading ? <Loading /> : undefined}
			</div>
		</div>
	)
}

interface EditCategoryProps {
	bp : BP,
	id : number | undefined,
	setCloseDialog : (a : boolean) => void,
}

export default EditCategory