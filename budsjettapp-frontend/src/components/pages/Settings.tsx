import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../../contexts/BudgetContext';

function Settings() {
	const {t, setShowSidebar} = useBudget();

	return (
		<main className="settings">
			<Link to="select-budget" className="button">{t.selectBudget}</Link>
			<Link to="edit-budget" className="button">{t.editCurrentBudget}</Link>
			<Link to="export-budget" className="button">{t.exportBudget}</Link>
		</main>
	)
}

export default Settings;