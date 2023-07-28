import React, {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../../contexts/BudgetContext';

function SyncButton() {
	const {activeBudget, setShowSidebar, t, token, fetchFromAPI} = useBudget();
	const [isSyncing, setIsSyncing] = useState(false);

	const onClick = () => {
		setIsSyncing(true);
		fetchFromAPI('sync')
		.then(() => setIsSyncing(false));

	}

	return (
		<button className={`button big-button ${isSyncing ? "syncing" : ""}`} onClick={() => fetchFromAPI('sync')}>
			{activeBudget.externalId ? <>
				<span className="button-icon"><FontAwesomeIcon icon={faRotate} /></span>
				<span className="button-text">{t.sidebarButtonSync}</span>
			</> : <>
				<span className="button-icon"><FontAwesomeIcon icon={isSyncing ? faSpinner : faCloudArrowUp} /></span>
				<span className="button-text">{t.sidebarButtonSaveToCloud}</span>
			</>}
		</button>
	)
}

export default SyncButton;