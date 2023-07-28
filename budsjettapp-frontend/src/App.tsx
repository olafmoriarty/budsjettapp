import React from 'react';

// Import CSS
import './css/budget.css';

// Import components
import Content from './components/Content';
import Dialog from './components/Dialog';
import ShowMenuButton from './components/ShowMenuButton';
import Sidebar from './components/Sidebar';

// Import context
import { BudgetProvider } from './contexts/BudgetContext';

/**
 * The main app file, to be called from index.tsx.
 * @returns The App component, displaying the website.
 */
function App() {

	// Return the app!
	return (
		<BudgetProvider>
			<Sidebar />
			<ShowMenuButton />
			<Content />
			<Dialog />
		</BudgetProvider>
	);

}

export default App;
