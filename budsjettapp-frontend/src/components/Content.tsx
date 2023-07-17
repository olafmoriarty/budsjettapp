import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import { BP } from '../interfaces/interfaces';
import Settings from './pages/Settings';
import BudgetScreen from './pages/BudgetScreen';
import Account from './pages/Account';
import EditBudget from './pages/settings/EditBudget';
import ExportBudget from './pages/settings/ExportBudget';

function Content(props : ContentProps) {
	const {bp} = props;
	if (!bp.activeBudget) {
		return <StartPage bp={props.bp} />
	}

	return <Routes>
		<Route path="/settings" element={<Settings bp={bp} />} />
		<Route path="/settings/select-budget" element={<StartPage bp={bp} />} />
		<Route path="/settings/edit-budget" element={<EditBudget bp={bp} />} />
		<Route path="/settings/export-budget" element={<ExportBudget bp={bp} />} />
		<Route path="/account/:id" element={<Account bp={bp} />} />
		<Route path="/*" element={<BudgetScreen bp={bp} />} />
	</Routes>
}

interface ContentProps {
	bp : BP,
}

export default Content;