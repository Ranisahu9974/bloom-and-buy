# Smart Ecommerce: System Documentation Details

This document provides all the specific details required for your project documentation, structured according to your requested outline.

---

## 01. Project Introduction
### 1.2 Project Profile
*   **Project Name:** Bloom & Buy - Smart AI E-commerce Platform
*   **Version:** 1.0.0 (Production Ready)
*   **Developers:** Vaishnavi & Team
*   **Frontend Framework:** React 19 (Vite)
*   **Backend Framework:** Django 6.0 (REST Framework)
*   **Database:** PostgreSQL (Production) / SQLite (Development)
*   **Core Logic:** AI-driven personalized shopping with a multi-channel notification mesh.

---

## 02. Proposed System
### 2.1 Scope & Objective
*   **Objective:** To build a high-performance, AI-integrated marketplace that manages consumers, suppliers, and admins through distinct portals.
*   **Scope:** The system covers product listing, advanced filtering, multi-model user profiles, real-time cart/wishlist management, secure payment gateways, and automated multi-channel (Email, SMS, WhatsApp) alerts.

### 2.2 Advantages
*   **AI Shopping Assistant:** Integrated OpenAI GPT models for smart product discovery.
*   **Omnichannel Notifications:** Ensures users never miss an order update via Twilio and SMTP.
*   **Role-Based Dashboards:** Specialized views for Admin (metrics) and Sellers (inventory).
*   **Dynamic UI:** Premium, glassmorphic UI design with high-performance Vite loading.

### 2.3 Feasibility Study
#### 2.3.1 Technical Feasibility
The project uses the Python-Django-React (MERN-style alternative) stack, which is highly stable, scalable, and has extensive third-party library support for AI and Payments.
#### 2.3.2 Economical Feasibility
Developed using open-source frameworks. Deployment uses Render’s free/flexible tier, minimizing initial infrastructure costs while allowing scalability.
#### 2.3.3 Operational Feasibility
The system is designed with a low learning curve, providing intuitive dashboards for non-technical suppliers to manage their stores easily.

---

## 03. System Analysis
### 3.1 Existing System
Traditional e-commerce platforms often lack personalized AI guidance and real-time cross-platform notifications (SMS/WhatsApp), relying solely on email or manual tracking.
### 3.2 Need For New System
There is a growing demand for "Smart" shopping. Consumers need proactive assistance (BloomBot) and sellers need automated financial tools like dynamic PDF invoicing and Razorpay processing.
### 3.3 Detailed SRS (Software Requirement Specification)
*   **Functional Requirements:**
    *   Auth: User login, registration, role selection.
    *   Store: Product CRUD, search, category filtering.
    *   Transactional: Cart management, Checkout, Payment Signature Verification.
    *   AI: OpenAI API integration for chatbot.
*   **Non-Functional Requirements:**
    *   Scalability: Support for large product catalogs.
    *   Security: JWT-based secure sessions.
    *   Reliability: PostgreSQL persistence.

---

## 04. System Planning
### 4.1 Requirement Analysis & Data Gathering
Data was gathered by analyzing current market trends in AI-commerce, buyer retention strategies (notifications), and supplier inventory pain points.
### 4.2 Time-line Chart (Gantt Summary)
1.  **Phase 1 (Month 1):** Database Schema & Auth Setup.
2.  **Phase 2 (Month 2):** Core Store Features & Product Logic.
3.  **Phase 3 (Month 3):** AI Assistant & Notification Mesh (Twilio/SMTP).
4.  **Phase 4 (Month 4):** Final UI Polish & Production Deployment.

---

## 05. Tools & Environment Used
### 5.1 Hardware and Software Requirement
#### 5.1.1 Software Requirement
*   OS: Windows 10/11 or Linux.
*   Editor: VS Code / JetBrains PyCharm.
*   Backend: Python 3.11+, Django REST Framework.
*   Frontend: Node.js 20+, React 19.
#### 5.1.2 Hardware Requirement
*   Processor: Intel i5 8th Gen or equivalent.
*   RAM: 8GB Minimum (16GB Recommended).
*   Storage: 500MB+ Cloud Storage for database/media.
#### 5.1.3 Technology to be used
*   **Django REST:** API Backbone.
*   **React + Vite:** Reactive UI.
*   **Render:** PaaS for deployment.

### 5.2 Server-Side and Client-side Tools
*   **Server-side:** Gunicorn, Whitenoise, PostgreSQL.
*   **Client-side:** Axios, React-Router-Dom, Recharts.

---

## 06. System Design
### 6.1 Database Design & Data Dictionary
| Table | Fields | Purpose |
| :--- | :--- | :--- |
| **AppUser** | id, username, email, role, phone | Core user identity & roles. |
| **Product** | name, price, stock, category_id, approval_status | Inventory details. |
| **Order** | user_id, total_price, status, transaction_id | Sales tracking. |
| **Address** | user_id, city, state, pincode, locality | Logistics data. |
| **Notification**| user_id, type, title, message, status | Communication logs. |

### 6.2 Database Relationship (ERD Summary)
*   `AppUser` **1:1** `SupplierProfile`.
*   `AppUser` **1:N** `Order`.
*   `Category` **1:N** `Product`.
*   `Order` **1:N** `OrderItem`.

### 6.3 User Interface Design (Screen Layouts)
*   **Home Page:** Hero banner, interactive product grid, AI chatbot bubble.
*   **Product Page:** Multi-criteria filters, AI-sorted product listings.
*   **Checkout:** Multi-step address selector and Razorpay payment modal.
*   **Dashboards:** Side-bar navigation with statistical charts (Recharts).

---

## 07. System Testing
### 7.1 Unit Testing
Performed on critical backend functions: `calculate_discount()`, `send_otp_via_twilio()`, and `validate_jwt()`.
### 7.2 Integration Testing
Ensured the React frontend correctly fetches and renders JSON data from Django API endpoints.
### 7.3 System Testing
End-to-end testing of the "Order Flow": User Register -> Add to Cart -> Checkout -> Payment -> Success Notification.

---

## 08. Limitations
*   Trial limits on OpenAI API usage.
*   Twilio SMS/WhatsApp messages require verified numbers in development.
*   SMTP email delivery depends on external provider (Gmail/SendGrid) stability.

---

## 09. Future Enhancement
*   **Mobile App:** Complementary Flutter/React Native application.
*   **AI Vision:** Search for products by uploading images.
*   **Automated Logistics:** Integration with Shiprocket or Delhivery for tracking.

---

## 10. References
### 10.1 Webography
*   [Django Project Documentation](https://docs.djangoproject.com/)
*   [React Dev Guides](https://react.dev/)
*   [Render Deployment Tutorials](https://render.com/docs)
### 10.2 Bibliography
*   "Django for APIs" by William S. Vincent.
*   "Pro React 16" by Adam Freeman.
