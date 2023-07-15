import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { BP } from '../../interfaces/interfaces';

function Settings(props : SettingsProps) {
	const {t, setShowSidebar} = props.bp;

	return (
		<main className="settings">
			<Link to="select-budget" className="button">{t.selectBudget}</Link>
			<Link to="edit-budget" className="button">{t.editCurrentBudget}</Link>
			<Link to="export-budget" className="button">{t.exportBudget}</Link>
		</main>
	)
}

interface SettingsProps {
	bp : BP,
}
export default Settings;