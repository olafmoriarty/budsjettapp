# Budsjett.app

[Budsjett.app](https://budsjett.app) is a budgeting app currently being developed. A more informative/verbose readme file will be added at a later point.

**Frontend:** React

**Backend:** PHP 8

## Todo list
*Continuously updated*
### Before beta launch
- [ ] Allow downloading budget from cloud
- [ ] Call syncBudget() on budget updates and update info on screen to match reality
- [ ] Add account types and create a debt category when adding a credit card or loan
- [ ] Add drag-and-drop reordering of accounts
- [ ] Allow hiding/deleting accounts
- [ ] Allow deleting categories
- [ ] When deleting budgets, add option to also delete from cloud
- [ ] Add scheduled payments
- [ ] Add account reconsiliation
- [ ] Add savings goals
- [ ] Auto-suggest budgeting amount 
- [ ] Add "Forgot password?" function
- [x] Implement React.lazy to cut down on load time
- [ ] **Launch closed beta**

### Before launch
- [ ] Consider pagination of API sync function
- [ ] Let users share budgets with other users
- [ ] Localize app - add Bokmål and English language files
- [ ] Write privacy policy (Norwegian and English)
- [ ] Write terms of use/sale (Norwegian and English)
- [ ] Write all help files (Norwegian and English)
- [ ] Implement payment solution (initially Vipps, maybe Stripe)
- [ ] Add button accessibility labels to buttons without text
- [ ] Set up gzip or something to cut down on load time
- [ ] **Launch site**

### If there's time for it before launch, maybe later
- [ ] Custom "Install app to device" button
- [ ] Add splash screen or something to inform user that a new service worker is available and that they can update the app to start using the new version
- [ ] Reorganize CSS to prevent render-blocking

### Crazy unrealistic wishlist
- [ ] Allow user to upload photos of receipts
- [ ] Allow user to import transactions directly from their bank
- [ ] Allow users to access the API (not *that* unrealistic, but definitely not a top priority)