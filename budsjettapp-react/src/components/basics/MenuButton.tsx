import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { BudgetProps } from '../../types/types';

function MenuButton(props : Props) {
  return (
	<button className="show-menu-button" onClick={() => props.bp.setShowMobileMenu(true)}><FontAwesomeIcon icon={faBars} /></button>
  )
}

interface Props {
	bp: BudgetProps,
}

export default MenuButton;