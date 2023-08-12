import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './Loading';
import StartPage from './pages/StartPage';
import Settings from './pages/Settings';
import Account from './pages/Account';
import EditBudget from './pages/settings/EditBudget';
import LogIn from './pages/LogIn';
import { useBudget } from '../contexts/BudgetContext';

const ExportBudget = lazy(() => import('./pages/settings/ExportBudget'));
const BudgetScreen = lazy(() => import('./pages/BudgetScreen'));

function Content() {
	const bp = useBudget();
	if (!bp.activeBudget) {
		return <StartPage />
	}

	return <Suspense fallback={<Loading />}>
		<Routes>
			<Route path="/settings" element={<Settings />} />
			<Route path="/settings/select-budget" element={<StartPage />} />
			<Route path="/settings/edit-budget" element={<EditBudget />} />
			<Route path="/settings/export-budget" element={<ExportBudget />} />
			<Route path="/account/:id" element={<Account />} />
			<Route path="/log-in" element={<LogIn />} />
			<Route path="/*" element={<BudgetScreen />} />
		</Routes>
	</Suspense>
}
export default Content;