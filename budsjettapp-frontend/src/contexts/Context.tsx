import React from 'react';
import { BudgetProvider } from './BudgetContext';
import { APIProvider } from './APIContext';

export const ContextProvider = (props : Props) => {
	return (
		<BudgetProvider>
		<APIProvider>
			{props.children}
		</APIProvider>
		</BudgetProvider>
	)
}

interface Props {
	children : JSX.Element | JSX.Element[],
}
