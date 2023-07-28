import React, {ReactText, useState} from 'react';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { DialogParams } from '../interfaces/interfaces';
import AddBudget from './dialogs/AddBudget';
import AddAccount from './dialogs/AddAccount';
import EditCategory from './dialogs/EditCategory';
import EditAccount from './dialogs/EditAccount';
import { useBudget } from '../contexts/BudgetContext';

function Dialog() {
	const {dialogBox, openDialog, dialogToShow} = useBudget();

	let dialogName : string;
	let dialogParams : DialogParams;

	if (typeof dialogToShow === "string" ) {
		dialogName = dialogToShow;
		dialogParams = {};
	}
	else {
		dialogName = dialogToShow[0];
		dialogParams = dialogToShow[1];
	}

	const [closeDialog, setCloseDialog] = useState(false);

	const closeDialogBox = (event : React.AnimationEvent) => {
		if (dialogBox && dialogBox.current && (event.animationName === 'hide-dialog' || event.animationName === 'hide-and-move-dialog')) {
			setCloseDialog(false);
			openDialog('');
			dialogBox.current.close();
		}
	}

	let selectedComponent : JSX.Element = <div></div>;
	switch (dialogName) {
		case 'addAccount':
			selectedComponent = <AddAccount />;
			break;
		case 'addBudget':
			selectedComponent = <AddBudget setCloseDialog={setCloseDialog} />;
			break;
		case 'editCategory':
			selectedComponent = <EditCategory id={dialogParams.id} setCloseDialog={setCloseDialog} />
			break;
		case 'editAccount':
			selectedComponent = <EditAccount account={dialogParams.account} setCloseDialog={setCloseDialog} />
			break;
		}

	const onKeyDown = (event : React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			setCloseDialog(true);
		}
	}

	return (
	<dialog ref={dialogBox} className={`modal ${closeDialog ? 'hide' : ''}`} onAnimationEnd={(event) => closeDialogBox(event)} onKeyDown={event => onKeyDown(event)}>
		<button className="modal-close" onClick={() => setCloseDialog(true)}><Icon icon={faTimes} /></button>
		{selectedComponent}
	</dialog>
  )
}

export default Dialog;