import React from 'react';
import { Link } from 'react-router-dom';
import { BP, DefaultProps } from '../interfaces/interfaces';
import AccountList from './AccountList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCogs, faCoins, faRotate, faTimes } from '@fortawesome/free-solid-svg-icons';


function Sidebar(props : DefaultProps) {
	const {t, activeBudget, showSidebar, setShowSidebar} = props.bp;

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

		<AccountList bp={props.bp} />

		<Link to="/" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faRotate} /></span>
			<span className="button-text">{t.sidebarButtonSync}</span>
		</Link>

		<Link to="/" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faChartLine} /></span>
			<span className="button-text">{t.sidebarButtonReports}</span>
		</Link>

		<Link to="/settings" className="button big-button" onClick={() => setShowSidebar(false)}>
			<span className="button-icon"><FontAwesomeIcon icon={faCogs} /></span>
			<span className="button-text">{t.sidebarButtonSettings}</span>
		</Link>
	</div>
}

export default Sidebar;