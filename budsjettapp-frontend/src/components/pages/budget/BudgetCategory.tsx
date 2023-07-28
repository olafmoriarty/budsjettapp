import React from 'react'

import BudgetCategoryName from './BudgetCategoryName';
import MonthCategory from './MonthCategory';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

import { BBP, Category } from '../../../interfaces/interfaces'
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';


function BudgetCategory(props : BudgetCategoryProps) {
	const {category, dragIndex, tabIndex, isMaster, provided, masterCategoryOpen, setMasterCategoryOpen, categoryRefIndex1} = props;
	const {categoryToEdit, setCategoryToEdit, currentMonth, categoryRefs} = props.bbp;

	if (categoryRefIndex1 !== undefined) {
		categoryRefs[categoryRefIndex1][dragIndex] = {};
	}

	const cells = <>
		<td className={`category-name${!isMaster ? ' no-icon' : ''}`} {...provided?.dragHandleProps} key={`category-name-${currentMonth}`}>
			{isMaster ? <button className="link toggle-master-category" onClick={() => {
				if (!setMasterCategoryOpen) {
					return;
				}
				setMasterCategoryOpen(!masterCategoryOpen);
			}}><FontAwesomeIcon icon={masterCategoryOpen ? faCaretDown : faCaretUp} /></button> : undefined}
			<BudgetCategoryName category={category} bbp={props.bbp} />
		</td>
		<td className="previous-month" key={`monthcategory-${category.id}-${currentMonth}-prev`}>
			<MonthCategory month={currentMonth - 1} category={category.id ? category.id : 0} categoryIndex={tabIndex} categoryRefIndex1={categoryRefIndex1} categoryRefIndex2={dragIndex} bbp={props.bbp} isMasterCategory={isMaster} />
		</td>
		<td className="current-month" key={`monthcategory-${category.id}-${currentMonth}`}>
			<MonthCategory month={currentMonth} category={category.id ? category.id : 0} categoryIndex={tabIndex} categoryRefIndex1={categoryRefIndex1} categoryRefIndex2={dragIndex} bbp={props.bbp} isMasterCategory={isMaster} />
		</td>
		<td className="next-month" key={`monthcategory-${category.id}-${currentMonth}-next`}>
			<MonthCategory month={currentMonth + 1} category={category.id ? category.id : 0} categoryIndex={tabIndex} categoryRefIndex1={categoryRefIndex1} categoryRefIndex2={dragIndex} bbp={props.bbp} isMasterCategory={isMaster} />
		</td>
	</>

	if (isMaster) {
		return (
			<tr className={`master-category${category.hidden ? ' hidden-category' : ''}`} key={category.id}>
				{cells}
			</tr>
		  )
	}

	if (category.hidden) {
		return <tr className="hidden-category" key={category.id}>
			{cells}
		</tr>
	}

	return 	<Draggable draggableId={category.id ? category.id.toString() : '0'} index={dragIndex}>
		{(provided, snapshot) => (
			<tr {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} key={category.id}>
			{cells}
		</tr>
	)}
	</Draggable>
}

interface BudgetCategoryProps {
	category : Category,
	tabIndex: number,
	dragIndex: number,
	categoryRefIndex1?: number,
	bbp: BBP,
	isMaster? : boolean,
	provided? : DraggableProvided,
	masterCategoryOpen? : boolean,
	setMasterCategoryOpen? : (a : boolean) => void,
}

export default BudgetCategory