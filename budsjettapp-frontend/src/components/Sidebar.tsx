import React from 'react';
import { Link } from 'react-router-dom';
import AccountList from './AccountList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCogs, faCoins, faTimes } from '@fortawesome/free-solid-svg-icons';
import SyncButton from './sidebar/SyncButton';
import { useBudget } from '../contexts/BudgetContext';


function Sidebar() {
	const {t, activeBudget, showSidebar, setShowSidebar} = useBudget();

	if (!activeBudget) {
		return <div className="sidebar sidebar-no-budget"></div>
	}

	return <div className={`sidebar ${showSidebar ? 'sidebar-visible' : 'sidebar-hidden'}`}>
		<button className="hide-sidebar" onClick={() => setShowSidebar(false)}><FontAwesomeIcon icon={faTimes} /></button>
		<h1>{activeBudget.name}</h1>
		<Link to="/" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faCoins} /></span>
			<span className="button-text">{t.sidebarButtonBudget}</span>
		</Link>

		<AccountList />

		<SyncButton />

		{/*
		<Link to="/" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faChartLine} /></span>
			<span className="button-text">{t.sidebarButtonReports}</span>
		</Link>
		*/}

		<Link to="/settings" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faCogs} /></span>
			<span className="button-text">{t.sidebarButtonSettings}</span>
		</Link>
	</div>
}

export default Sidebar;