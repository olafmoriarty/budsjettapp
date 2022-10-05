import React from 'react'

function Accounts(props) {
	const {accounts} = props;

	if (!accounts || !accounts.length) {
		return <div className="accounts">
			<button>Opprett konto</button>
		</div>
	}

	return (
		<div className="accounts">
			{accounts.map(el => {
				return <div className="account">
					<div className="account-name">
						{el.name}
					</div>
					<div className="account-balance">
						{el.balance.toFixed(2).replace('.', ',')}
					</div>
				</div>;
			})}
			<button>Opprett ny konto</button>
		</div>
	)
}

export default Accounts