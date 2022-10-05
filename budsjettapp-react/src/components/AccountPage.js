import Transaction from "./Transaction";

function AccountPage(props) {
	const {transactions} = props;
	return (
		<main className="account-page">
			<h1>Brukskonto</h1>
			<table>
				<tbody>
					{transactions.map(el => <Transaction showAccount={false} details={el} />)}
				</tbody>
			</table>
		</main>
	)
}

export default AccountPage;