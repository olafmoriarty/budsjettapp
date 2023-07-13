import { Category } from "../interfaces/interfaces";

const sortBySort = (a : Category, b : Category) => {
	const aIndex = a.sort ? a.sort : 0;
	const bIndex = b.sort ? b.sort : 0;
	if (aIndex < bIndex) {
		return -1;
	}
	if (aIndex > bIndex) {
		return 1;
	}
	return 0;
}

export default sortBySort;