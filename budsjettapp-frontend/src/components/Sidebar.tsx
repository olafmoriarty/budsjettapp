import React from 'react';
import { Link } from 'react-router-dom';
import { BP } from '../interfaces/interfaces';
import AccountList from './AccountList';


function Sidebar(props : SidebarProps) {
	const {t, activeBudget} = props.bp;

	if (!activeBudget) {
		return <div className="sidebar sidebar-no-budget"></div>
	}

	return <div className={`sidebar ${props.showSidebar ? 'sidebar-visible' : 'sidebar-hidden'}`}>
		<h1>{activeBudget.name}</h1>
		<Link to="/budget" className="button">{t.sidebarButtonBudget}</Link>
		<AccountList bp={props.bp} />
		<Link to="/settings" className="button">{t.sidebarButtonSettings}</Link>
	</div>
}

interface SidebarProps {
	bp : BP,
	showSidebar : boolean,
}

export default Sidebar;