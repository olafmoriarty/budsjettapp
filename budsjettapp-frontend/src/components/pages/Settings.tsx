import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { BP } from '../../interfaces/interfaces';

function Settings(props : SettingsProps) {
	const {t, setShowSidebar} = props.bp;

	return (
		<main className="settings">
			<Link to="select-budget" className="button">{t.selectBudget}</Link>
		</main>
	)
}

interface SettingsProps {
	bp : BP,
}
export default Settings;