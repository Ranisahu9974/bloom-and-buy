# Implementation Plan - Smart_Ecommerce Features

## Task List

- [ ] Mail functionality implementation/fix
- [ ] Search bar implementation/fix
- [ ] Dynamic discount calculations/display
- [ ] Dynamic top content (homepage banner/section)
- [ ] Admin Dashboard fixes:
    - [ ] Product list view and edit functionality
    - [ ] Seller detail view with product list
- [ ] Connectivity check: ensure frontend and backend are properly connected

## Initial Step: Code Exploration & Status Check

1.  **Mail Functionality**:
    *   Search for any existing mail settings in `Backend/core/settings.py`.
    *   Check for occurrences of `send_mail` or similar functions in the backend.
2.  **Search Bar**:
    *   Find the search component in `frontend/src`.
    *   Verify how it's currently implemented (if at all) and find the corresponding API endpoint in the backend.
3.  **Dynamic Discount**:
    *   Identify how discounts are currently stored in the products/store app in the backend.
    *   Ensure the frontend correctly calculates/displays them dynamically.
4.  **Dynamic Top Content**:
    *   Find the homepage component in the frontend.
    *   Determine where the "top content" originates (is it hardcoded or from the backend?).
5.  **Admin Dashboard**:
    *   Check `frontend/src/pages/AdminDashboard.jsx` (already listed in open documents).
    *   Examine the corresponding backend views for admin/seller management.
6.  **Connectivity**:
    *   Check frontend API service or Axios configuration.
    *   Verify CORS settings in Django.
