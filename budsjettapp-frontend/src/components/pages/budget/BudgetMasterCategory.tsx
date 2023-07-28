import React, {useState} from 'react'

import { BBP, Category } from '../../../interfaces/interfaces'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import BudgetCategory from './BudgetCategory';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import sortBySort from '../../../functions/sortBySort';
import { useBudget } from '../../../contexts/BudgetContext';

function BudgetMasterCategory(props : MasterCategoryProps) {
	const {category, index} = props;
	const {createCategory, categoryRefs} = props.bbp;
	const {categories, t} = useBudget();

	categoryRefs[index] = [];

	const [masterCategoryOpen, setMasterCategoryOpen] = useState(true);

	if (!category.id) {
		return null;
	}

	const mergeRefs = (inputRef1 : Function, inputRef2 : Function) => {
		return (ref : HTMLTableSectionElement) => {
			inputRef1(ref);
			inputRef2(ref);
		}
	}
  return (
	<Draggable draggableId={category.id.toString()} index={index}>
		{(dragProvided, snapshot) => (
			<Droppable droppableId={category.id ? category.id.toString() : '0'} type="SUBCAT">
				{(dropProvided, snapshot) => (
				<tbody ref={mergeRefs(dragProvided.innerRef, dropProvided.innerRef)} {...dragProvided.draggableProps} {...dropProvided.droppableProps}>
				<BudgetCategory category={category} bbp={props.bbp} tabIndex={index * 20} dragIndex={index} isMaster={true} provided={dragProvided} masterCategoryOpen={masterCategoryOpen} setMasterCategoryOpen={setMasterCategoryOpen} />
				{masterCategoryOpen ? categories.filter((subcat) => subcat.parent === category.id && (props.bbp.showHidden || !subcat.hidden)).sort((a, b) => sortBySort(a, b)).map((subEl, subIndex) => <BudgetCategory key={subEl.id} category={subEl} bbp={props.bbp} tabIndex={index * 20 + subIndex} categoryRefIndex1={index} dragIndex={subIndex} />) : undefined}
				{masterCategoryOpen ? <tr className="add-new-category">
					<td className="category-name" key={`add-category-${category.id}-${props.bbp.currentMonth}`}><button className="link hoverlink" onClick={() => createCategory(category.id)}><FontAwesomeIcon icon={faPlus} /> {t.newCategory}</button></td>
					<td></td>
					<td></td>
					<td></td>
				</tr> : undefined}
				{dropProvided.placeholder}
			</tbody>
			)}
			</Droppable>
		)}
	</Draggable>
  )
}

interface MasterCategoryProps {
	bbp : BBP,
	index : number,
	category : Category,
}

export default BudgetMasterCategory