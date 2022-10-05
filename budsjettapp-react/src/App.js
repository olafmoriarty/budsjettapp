import AccountPage from './components/AccountPage';
import Sidebar from './components/Sidebar';
import './css/index.css';

function App() {

	const transactions = [
		{
			date: '2022-10-01',
			payeeId: 5,
			payeeName: 'Rema 1000',
			accountId: 1,
			accountName: 'Brukskonto',
			categoryId: 1,
			categoryName: 'Dagligvarer',
			memo: 'Majones og gåselever',
			in: 0,
			out: 45.20,
			synced: false,
		}
	];

	return (
		<div className="app">
			<Sidebar
				accounts={[
				{
					name: 'Brukskonto',
					balance: 2454.42,
				},
				{
					name: 'Regningskonto',
					balance: 8288,
				},
				]}
			/>
			<AccountPage 
				transactions={transactions.filter(el => el.accountId === 1)}
			/>
		</div>
	);
}

export default App;