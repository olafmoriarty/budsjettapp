import React, {useState, useEffect} from 'react';
import { DefaultProps } from '../../interfaces/interfaces';
import MonthCategory from './MonthCategory';
import MonthHeader from './MonthHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons';

function BudgetScreen(props : DefaultProps) {
	const { activeBudget, setShowSidebar, categories, setCategories } = props.bp;

	const d = new Date();
	const [currentMonth, setCurrentMonth] = useState(
		((d.getFullYear() - 2000) * 12) + d.getMonth()
	);

	useEffect(() => {
		setShowSidebar(false);
	}, [setShowSidebar]);

	if (!activeBudget || !activeBudget.id) {
		return null;
	}

	const addCategory = (parent? : number) => {
		console.log('Test');
		console.log(parent);
		let newCategories =  [...categories];
		if (activeBudget.id) {
			newCategories.push({name: 'Ny kategori', parent: parent, budgetId: activeBudget.id },
			);
			setCategories(newCategories);
		}
	}

	return (
	<main className="budget">
		<table>
			<thead>
				<tr>
					<th className="category-name"></th>
					<th className="previous-month"><MonthHeader monthId={currentMonth - 1} bp={props.bp} /></th>
					<th className="current-month"><MonthHeader monthId={currentMonth} bp={props.bp} /></th>
					<th className="next-month"><MonthHeader monthId={currentMonth + 1} bp={props.bp} /></th>
				</tr>
			</thead>
			<tbody>
				{categories.filter((el) => !el.parent).map((el, index) => <>
				<tr className="master-category" key={el.id}>
					<td className="category-name"><FontAwesomeIcon icon={faCaretDown} /> {el.name}</td>
					<td className="previous-month">
						<MonthCategory isMasterCategory={true} month={currentMonth - 1} category={el.id} categoryIndex={index * 20} bp={props.bp} />
					</td>
					<td className="current-month">
						<MonthCategory isMasterCategory={true} month={currentMonth} category={el.id} categoryIndex={index * 20} bp={props.bp} />
					</td>
					<td className="next-month">
						<MonthCategory isMasterCategory={true} month={currentMonth + 1} category={el.id} categoryIndex={index * 20} bp={props.bp} />
					</td>
				</tr>
				{categories.filter((subcat) => subcat.parent === el.id).map((subEl, subIndex) => <tr key={subEl.id}>
					<td className="category-name"><button className="link hoverlink">{subEl.name}</button></td>
					<td className="previous-month">
						<MonthCategory month={currentMonth - 1} category={subEl.id} categoryIndex={index * 20 + subIndex} bp={props.bp} />
					</td>
					<td className="current-month">
						<MonthCategory month={currentMonth} category={subEl.id} categoryIndex={index * 20 + subIndex} bp={props.bp} />
					</td>
					<td className="next-month">
						<MonthCategory month={currentMonth + 1} category={subEl.id} categoryIndex={index * 20 + subIndex} bp={props.bp} />
					</td>
				</tr>)}
				<tr className="add-new-category">
					<td className="category-name"><button className="link hoverlink" onClick={() => addCategory(el.id)}><FontAwesomeIcon icon={faPlus} /> Ny kategori</button></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				</>)}
				<tr className="master-category">
					<td className="category-name"><button className="link hoverlink" onClick={() => addCategory()}><FontAwesomeIcon icon={faPlus} /> Ny hovudkategori</button></td>
						<td></td>
						<td></td>
						<td></td>
				</tr>
			</tbody>
		</table>
	</main>
  )
}

export default BudgetScreen