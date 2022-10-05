import Accounts from './Accounts';

function Sidebar(props) {
	const {accounts} = props;
  return (
	<nav className="sidebar">
		<Accounts accounts={accounts} />
	</nav>

  )
}

export default Sidebar;