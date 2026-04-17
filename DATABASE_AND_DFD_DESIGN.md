# Detailed Database Design & Data Flow Diagrams (DFD)

This document provides a highly detailed technical specification of the **Smart Ecommerce Platform (Bloom & Buy)** database architecture and logical data flow.

---

## 1. Data Flow Diagrams (DFD)

### DFD Level 0: Context Diagram
The Level 0 DFD defines the system boundary and external entities.

```mermaid
graph LR
    U[User]
    S[Supplier]
    A[Admin]
    RP[[Razorpay Gateway]]
    TE[[Twilio/Email API]]
    OA[[OpenAI API]]
    
    System(((Smart Ecommerce Platform)))
    
    U -- "Browse, Cart, Order, Chat" --> System
    System -- "Products, Success Msg, AI Reply" --> U
    
    S -- "Manage Inventory, Stats" --> System
    System -- "Reports, Notifications" --> S
    
    A -- "Manage Users, Approvals" --> System
    System -- "Logs, Metrics" --> A
    
    System -- "Payment Request" --> RP
    RP -- "Payment Response" --> System
    
    System -- "Notification Data" --> TE
    System -- "AI Queries" --> OA
```

### DFD Level 1: Functional Breakdown
Breaking the system into core sub-processes.

```mermaid
graph TD
    %% Processes
    P1[1.0 Auth & Profile Mgmt]
    P2[2.0 Catalog & Search]
    P3[3.0 Transaction Engine]
    P4[4.0 AI Assistant]
    P5[5.0 Notification Hub]
    P6[6.0 Admin Dashboard]

    %% Flow
    User([User]) -->|Register/Login| P1
    P1 -->|Session| User
    
    User -->|Product Search| P2
    P2 -->|Catalog Data| User
    
    User -->|Checkout & Pay| P3
    P3 -->|Payment Intent| RP[[Razorpay]]
    RP -->|Verification| P3
    
    User -->|Chat Queries| P4
    P4 -->|Prompt| OA[[OpenAI]]
    OA -->|Response| P4
    P4 -->|AI Support| User
    
    P3 -->|Order Event| P5
    P6 -->|Approval Notification| P5
    P5 -->|SMS/WA/Email| User
    
    Admin([Admin]) -->|Approve Products| P6
    P6 -->|Update Status| P2
```

### DFD Level 2: Order & Payment Processing
Refining the transaction process.

```mermaid
graph TD
    Proc1[3.1 Validation & Inventory Check]
    Proc2[3.2 Create Order Instance]
    Proc3[3.3 Payment Gateway Handshake]
    Proc4[3.4 Verify Signature]
    Proc5[3.5 Update Stock & Status]
    
    Cart[(Cart Data)] --> Proc1
    Proc1 --> Proc2
    Proc2 --> Proc3
    Proc3 -- API Call --> RP[[Razorpay]]
    RP -- Callback --> Proc4
    Proc4 -- Success --> Proc5
    Proc5 --> DB_Order[(Order DB)]
    Proc5 --> DB_Stock[(Product DB)]
```

---

## 2. Comprehensive Data Dictionary

### 2.1 User & Identity Management
| Table Name | Field Name | Datatype | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **auth_user** | `id` | INT | PK | Django's built-in user model. |
| | `username` | VARCHAR | Unique | Login handle. |
| | `email` | VARCHAR | Unique | Account identifier. |
| **AppUser** | `id` | INT | PK | Custom wrapper for user roles. |
| | `user_auth` | INT | FK (auth_user) | Link to Django Auth. |
| | `role` | ENUM | admin/supplier/consumer| Access control levels. |
| **SupplierProfile**| `user_id`| INT | FK (AppUser) | Seller specific details. |
| | `company_name`| VARCHAR | NOT NULL | Business name. |
| | `gst_number` | VARCHAR | Nullable | Tax registration. |
| **ConsumerProfile**| `user_id`| INT | FK (AppUser) | Buyer specific details. |
| | `wallet_balance`| DECIMAL | Default 0 | In-app credit for refunds. |
| **Address** | `user_id` | INT | FK (AppUser) | Delivery address repository. |

### 2.2 Store & Inventory
| Table Name | Field Name | Datatype | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Category** | `id` | INT | PK | Product grouping. |
| | `name` | VARCHAR | Unique | Category label. |
| **Product** | `id` | INT | PK | Main inventory item. |
| | `supplier_id`| INT | FK (auth_user) | Reference to seller. |
| | `category_id`| INT | FK (Category) | Product category link. |
| | `price` | DECIMAL | > 0 | Unit price. |
| | `stock` | INT | >= 0 | Quantity available. |
| | `approval_status`| ENUM | pending/approved/rejected | Admin moderation state. |
| **CartItem** | `cart_id` | INT | FK (Cart) | Items in user basket. |
| | `product_id` | INT | FK (Product) | Item reference. |
| | `quantity` | INT | > 0 | Count of items. |

### 2.3 Sales & Transactions
| Table Name | Field Name | Datatype | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Order** | `id` | INT | PK | Unique transaction ID. |
| | `user_id` | INT | FK (auth_user) | Buyer reference. |
| | `total_price`| DECIMAL | NOT NULL | Amount paid. |
| | `status` | ENUM | Pending...Delivered | Delivery progress. |
| **OrderItem** | `order_id` | INT | FK (Order) | Line items in order. |
| | `product_id` | INT | FK (Product) | Item purchased. |
| **Payment** | `id` | INT | PK | Financial audit log. |
| | `order_id` | INT | FK (Order) | Linked order. |
| | `transaction_id`| VARCHAR | Unique | Third-party TX ID. |

### 2.4 AI & Support
| Table Name | Field Name | Datatype | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **ChatbotLog** | `user_id` | INT | FK (AppUser) | History of AI interactions. |
| | `query` | TEXT | | User's question. |
| | `response` | TEXT | | AI's generated answer. |
| **ProductAIScore**| `product_id`| INT | FK (Product) | Machine learning rating. |

---

## 3. Comprehensive Entity Relationship (ER) Diagram

This diagram represents the full schema with all significant fields (attributes) to show the "data" structure of each table.

```mermaid
erDiagram
    %% Identity & Profiles
    APP_USER {
        int id PK
        string username
        string email
        string password
        string role
        string phone
        boolean is_active
        datetime created_at
    }
    SUPPLIER_PROFILE {
        int id PK
        int user_id FK
        string company_name
        string gst_number
        string address
        float rating
        boolean verified
    }
    CONSUMER_PROFILE {
        int id PK
        int user_id FK
        decimal wallet_balance
        boolean is_opted_in
    }
    ADDRESS {
        int id PK
        int user_id FK
        string full_name
        string city
        string state
        string pincode
        boolean is_default
    }

    %% Store & Products
    CATEGORY {
        int id PK
        string name
        string slug
    }
    PRODUCT {
        int id PK
        int supplier_id FK
        int category_id FK
        string name
        decimal price
        int stock
        string approval_status
        datetime created_at
    }
    CART {
        int id PK
        int user_id FK
        datetime created_at
    }
    CART_ITEM {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }
    WISHLIST {
        int id PK
        int user_id FK
    }

    %% Transactions
    ORDER {
        int id PK
        int user_id FK
        decimal total_price
        string status
        string payment_status
        string tracking_id
        datetime created_at
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
    PAYMENT {
        int id PK
        int order_id FK
        string transaction_id
        string razorpay_order_id
        decimal amount
        boolean is_successful
    }

    %% AI & Support
    CHATBOT_LOG {
        int id PK
        int user_id FK
        string query
        string intent
        string response
    }
    PRODUCT_AI_SCORE {
        int id PK
        int product_id FK
        float demand_score
        float trust_score
    }
    MEMBERSHIP_PLAN {
        int id PK
        int user_id FK
        string membership_type
        date membership_end_date
        decimal discount_rate
    }

    %% Relationships
    APP_USER ||--o| SUPPLIER_PROFILE : "as-seller"
    APP_USER ||--o| CONSUMER_PROFILE : "as-buyer"
    APP_USER ||--o{ ADDRESS : "saved-at"
    APP_USER ||--o{ ORDER : "places"
    APP_USER ||--o| CART : "owns"
    APP_USER ||--o| WISHLIST : "curates"
    APP_USER ||--o{ CHATBOT_LOG : "queries"
    APP_USER ||--o{ MEMBERSHIP_PLAN : "subscribed-to"

    CATEGORY ||--o{ PRODUCT : "classifies"
    PRODUCT ||--o{ CART_ITEM : "added-to"
    CART ||--o{ CART_ITEM : "holds"
    
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "purchased"
    ORDER ||--|| PAYMENT : "settles"
    
    PRODUCT ||--o| PRODUCT_AI_SCORE : "scored-as"
```

---
*End of Technical Specification Version 2.2*
