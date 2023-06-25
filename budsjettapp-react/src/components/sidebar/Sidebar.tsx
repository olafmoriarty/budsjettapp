import React from 'react';
import { BudgetProps } from '../../types/types';
import Accounts from './Accounts';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faTimes, faGears } from '@fortawesome/free-solid-svg-icons';

function Sidebar(props : Props) {
	const {budgetInfo, showMobileMenu, setShowMobileMenu, setPageToShow} = props.bp;
	return (
	<nav className={`sidebar${showMobileMenu ? "" : " hide"}`}>
		<button className="close-dialog-button" onClick={() => setShowMobileMenu(false)}><FontAwesomeIcon icon={faTimes} /></button>
		
		<h1>{budgetInfo.name}</h1>
		<div className="big-buttons">
			<p className="budget-button"><button className="button" onClick={() => setPageToShow('budget')}><span className="button-icon"><FontAwesomeIcon icon={faCoins} /></span> Budsjett</button></p>	
		</div>
		
		<Accounts bp={props.bp} />

		<div className="big-buttons">
			<p className="budget-button"><button className="button"><span className="button-icon"><FontAwesomeIcon icon={faGears} /></span> Innstillinger</button></p>	
		</div>

	</nav>

  )
}

interface Props {
	bp: BudgetProps,
}

export default Sidebar;