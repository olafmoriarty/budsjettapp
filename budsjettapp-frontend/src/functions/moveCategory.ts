import { BP } from "../interfaces/interfaces";
import addCategory from "./database/addCategory";
import sortBySort from "./sortBySort";

const moveCategory = (bp : BP, categoryId : number, newIndex : number, newParent? : number) => {
	const {db, categories, setCategories} = bp;

	// Get category to move
	const oldCategory = categories.filter((el) => el.id === categoryId)[0];

	// Get which parent the category should be in
	const parent = newParent ? newParent : oldCategory.parent;

	// Get all categories in parent category, excluding the category we're moving, and sort them by current sort index
	const sorted = categories.filter((el) => el.parent === parent && el.budgetId === oldCategory.budgetId && el.id !== categoryId).sort((a, b) => sortBySort(a, b));

	// Insert moved category into category list at correct index
	let newCategories;
	
	if (newIndex === -1) {
		newCategories = [...sorted, oldCategory];
	}
	else {
		newCategories = [...sorted.slice(0, newIndex), oldCategory, ...sorted.slice(newIndex)];
	}

	// Update parent and sorting index for all categories in parent category
	newCategories.forEach((el, index) => {
		newCategories[index] = {...el, parent: parent, sort: index + 1, synced: el.sort === index + 1 && el.parent === parent ? true : false};
	});

	// If the category is moving to a new parent category ...
	if (newParent && newParent !== oldCategory.parent) {

		// Get all categories in old parent category, excluding the category we're moving, and sort them by sort index
		const oldSorted = categories.filter((el) => el.parent === oldCategory.parent && el.budgetId === oldCategory.budgetId && el.id !== categoryId).sort((a, b) => sortBySort(a, b));

		// Update sorting index for all categories in old parent category
		oldSorted.forEach((el, index) => {
			oldSorted[index] = {...el, sort: index + 1, synced: el.sort === index + 1 ? true : false}
		});

		// Concatenate arrays for further processing
		newCategories = newCategories.concat(oldSorted);
	}

	// Remove unchanged categories
	newCategories = newCategories.filter(el => !el.synced);

	// Category ids to update
	const newCategoryIds = newCategories.map(el => el.id);

	// Remove updated categories from old category list, add the updated categories, and sort by id
	const allCategories = categories.filter(el => !newCategoryIds.includes(el.id)).concat(newCategories).sort((a, b) => {
		const aIndex = a.id ? a.id : 0;
		const bIndex = b.id ? b.id : 0;
		if (aIndex < bIndex) {
			return -1;
		}
		if (aIndex > bIndex) {
			return 1;
		}
		return 0;
	});

	// Update category list
	setCategories(allCategories);

	// Update database

	const promises = [] as Promise<number | undefined>[];
	newCategories.forEach(el => {
		promises.push(addCategory(db, el));
	})

	return Promise.all(promises);
}

export default moveCategory;