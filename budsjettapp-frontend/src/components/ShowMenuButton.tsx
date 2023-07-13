import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { DefaultProps } from '../interfaces/interfaces';

function ShowMenuButton(props : DefaultProps) {
	const {showSidebar, setShowSidebar, activeBudget} = props.bp;
	if (!activeBudget || showSidebar) {
		return null;
	}
  return (
	<div className="show-menu" onClick={() => setShowSidebar(true)}><button className="icon"><FontAwesomeIcon icon={faBars} /></button></div>
  )
}

export default ShowMenuButton