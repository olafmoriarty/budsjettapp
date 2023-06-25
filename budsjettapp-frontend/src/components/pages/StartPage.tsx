import React, {useState, useEffect} from 'react'
import getBudgets from '../../functions/database/getBudgets';
import { Budget, DefaultProps } from '../../interfaces/interfaces';

function StartPage(props : DefaultProps) {
	const {t, db, selectBudget, openDialog} = props.bp;
	const [allBudgets, setAllBudgets] = useState([] as Budget[]);
	const [showAllBudgets, setShowAllBudgets] = useState(false);
	const budgetsToShow = 3;

	useEffect(() => {
		if (db) {
			getBudgets(db)
			.then((value) => {
				setAllBudgets(Array.isArray(value) ? value : []);
			});
		}
	}, [db]);

	return (
		<main className="settings">
			<h1 className="app-name">{t.appName}</h1>
			{allBudgets
				.slice(0, showAllBudgets ? undefined : budgetsToShow)
				.map((el, index) => <button 
					className="button select-budget"
					onClick={() => selectBudget(el)}
					key={index}
					>{el.name}</button>)}
			{allBudgets.length > budgetsToShow && !showAllBudgets ? <button className="button select-budget" onClick={() => setShowAllBudgets(true)}>{t.showAllBudgets}</button> : undefined}
			<button className="button" onClick={() => openDialog('addBudget')}>{t.newBudget}</button>
			<button className="button">{t.downloadBudget}</button>
		</main>
	)
}

export default StartPage;