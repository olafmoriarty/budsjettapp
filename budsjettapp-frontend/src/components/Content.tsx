import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import Settings from './pages/Settings';
import BudgetScreen from './pages/BudgetScreen';
import Account from './pages/Account';
import EditBudget from './pages/settings/EditBudget';
import ExportBudget from './pages/settings/ExportBudget';
import LogIn from './pages/LogIn';
import { useBudget } from '../contexts/BudgetContext';

function Content() {
	const bp = useBudget();
	if (!bp.activeBudget) {
		return <StartPage />
	}

	return <Routes>
		<Route path="/settings" element={<Settings />} />
		<Route path="/settings/select-budget" element={<StartPage />} />
		<Route path="/settings/edit-budget" element={<EditBudget />} />
		<Route path="/settings/export-budget" element={<ExportBudget />} />
		<Route path="/account/:id" element={<Account />} />
		<Route path="/log-in" element={<LogIn />} />
		<Route path="/*" element={<BudgetScreen />} />
	</Routes>
}
export default Content;