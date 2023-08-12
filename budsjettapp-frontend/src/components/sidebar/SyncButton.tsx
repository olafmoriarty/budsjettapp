import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../../contexts/BudgetContext';
import { useAPI } from '../../contexts/APIContext';

function SyncButton() {
	const {activeBudget, t} = useBudget();
	const {isFetching, setIsFetching, syncBudget, syncCount} = useAPI();

	const onClick = async () => {
		if (isFetching) {
			return;
		}
		setIsFetching(true);		
		await syncBudget({
			redirect: true,
		});
		setIsFetching(false);
	}

	return (
		<button className={`button big-button ${isFetching ? "syncing" : ""}`} onClick={onClick}>
			{activeBudget.externalId ? <>
				<span className="button-icon"><FontAwesomeIcon icon={faRotate} /></span>
				<span className="button-text">{t.sidebarButtonSync}</span>
				{syncCount ? <span className="sync-count">{syncCount}</span> : undefined}
			</> : <>
				<span className="button-icon"><FontAwesomeIcon icon={isFetching ? faSpinner : faCloudArrowUp} /></span>
				<span className="button-text">{t.sidebarButtonSaveToCloud}</span>
			</>}
		</button>
	)
}

export default SyncButton;