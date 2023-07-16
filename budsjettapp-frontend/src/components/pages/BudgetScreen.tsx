import React, {useState, useEffect} from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import { BudgetNumbers, Category, DefaultProps } from '../../interfaces/interfaces';
import MonthHeader from './budget/MonthHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faAnglesLeft, faAngleLeft, faAngleRight, faAnglesRight } from '@fortawesome/free-solid-svg-icons';

import sortBySort from '../../functions/sortBySort';

import addCategory from '../../functions/database/addCategory';
import BudgetMasterCategory from './budget/BudgetMasterCategory';
import moveCategory from '../../functions/moveCategory';
import getBudgetNumbersDB from '../../functions/database/getBudgetNumbersDB';

function BudgetScreen(props : DefaultProps) {
	const { db, t, activeBudget, showSidebar, setShowSidebar, categories, setCategories } = props.bp;

	const [categoryToEdit, setCategoryToEdit] = useState(undefined as number | undefined);

	const [budgetNumbers, setBudgetNumbers] = useState({} as BudgetNumbers);
	const [showHidden, setShowHidden] = useState(false);

	const [scrollDirection, setScrollDirection] = useState(undefined as 'left' | 'right' | undefined);

	const d = new Date();
	const [currentMonth, setCurrentMonth] = useState(
		((d.getFullYear() - 2000) * 12) + d.getMonth()
	);

	useEffect(() => {
		// If budgetNumbers is already set, get the numbers
		getBudgetNumbersDB( db, activeBudget.id || 0, currentMonth - 1, currentMonth + 1 )
		.then((newBudgetNumbers) => {
				setBudgetNumbers(newBudgetNumbers);
		});
	}, [currentMonth]);

	if (!activeBudget || !activeBudget.id) {
		return null;
	}

	const createCategory = (parent? : number) => {
		let newCategories =  [...categories];

		if (activeBudget.id) {

			const sort = categories.filter((el) => el.parent === parent).length + 1;

			let newCategory = {
				name: t.newCategoryName, 
				parent: parent, 
				budgetId: activeBudget.id,
				sort: sort,
				synced: false,
			} as Category;
			addCategory(db, newCategory)
			.then((categoryId) => {
				newCategory.id = categoryId; 
				newCategories.push(newCategory);
				setCategories(newCategories);
				setCategoryToEdit(categoryId);
			});
		}
	}

	const onDragEnd = (result : DropResult) => {
		if (!result.destination) {
			return;
		}
		moveCategory(props.bp, Number(result.draggableId), result.destination?.index, result.type === "SUBCAT" && result.source.droppableId !== result.destination.droppableId ? Number(result.destination.droppableId) : undefined);
		return;
	}

	const bbp = {
		budgetNumbers: budgetNumbers, 
		setBudgetNumbers: setBudgetNumbers, 
		categoryToEdit: categoryToEdit, 
		setCategoryToEdit: setCategoryToEdit, 
		createCategory: createCategory, 
		currentMonth: currentMonth, 
		showHidden: showHidden
	};

	const scrollBudget = (direction : 'left' | 'right', scrollLength = 1) => {
		setScrollDirection(direction);
		setCurrentMonth(direction === 'left' ? currentMonth - scrollLength : currentMonth + scrollLength);
	}

	return (
	<main className="budget">
		<nav className="select-month-buttons">
			<button className="icon prev-three" onClick={() => scrollBudget('left', 3)}><FontAwesomeIcon icon={faAnglesLeft} /></button>
			<button className="icon prev-one" onClick={() => scrollBudget('left')}><FontAwesomeIcon icon={faAngleLeft} /></button>
			<button className="icon next-one" onClick={() => scrollBudget('right')}><FontAwesomeIcon icon={faAngleRight} /></button>
			<button className="icon next-three" onClick={() => scrollBudget('right', 3)}><FontAwesomeIcon icon={faAnglesRight} /></button>
		</nav>

		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='masterCategories' type="MASTER">
				{(provided, snapshot) => (
				<table className={`budget ${scrollDirection === 'left' ? 'budget-scroll-left' : (scrollDirection === 'right' ? 'budget-scroll-right' : '')}`} ref={provided.innerRef} {...provided.droppableProps}>
					<thead>
						<tr>
							<th className="category-name">
							</th>
							<th className="previous-month" key={`header-${currentMonth}-prev`}><MonthHeader monthId={currentMonth - 1} bp={props.bp} bbp={bbp} /></th>
							<th className="current-month" key={`header-${currentMonth}`}><MonthHeader monthId={currentMonth} bp={props.bp} bbp={bbp} /></th>
							<th className="next-month" key={`header-${currentMonth}-next`}><MonthHeader monthId={currentMonth + 1} bp={props.bp} bbp={bbp} /></th>
						</tr>
					</thead>
					{categories.filter((el) => !el.parent && (showHidden || !el.hidden) && !el.deleted).sort((a, b) => sortBySort(a, b)).map((el, index) => <BudgetMasterCategory key={el.id} bp={props.bp} category={el} index={index} bbp={bbp} />)}
					<tbody>
						<tr className="master-category" key={`add-master-category-${currentMonth}`}>
							<td className="category-name"><button className="link hoverlink" onClick={() => createCategory()}><FontAwesomeIcon icon={faPlus} /> {t.newMainCategory}</button></td>
							<td></td>
							<td></td>
							<td></td>
						</tr>
					</tbody>
					{provided.placeholder}
				</table>
				)}
			</Droppable>
		</DragDropContext>
		{categories.filter(el => el.hidden === true).length ? <p className="show-hidden-categories"><label><input name="show-hidden-categories" type="checkbox" checked={showHidden} onChange={(event) => setShowHidden(event.currentTarget.checked)} /> {t.showHiddenCategories}</label></p> : undefined}
	</main>
  )
}

export default BudgetScreen;