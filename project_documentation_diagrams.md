# Smart Ecommerce Project Documentation

This document provides a comprehensive architectural overview of the **Smart Ecommerce** platform. These diagrams are designed for project reports and technical documentation.

---

## 1. Use Case Diagram (Who can do what?)
This diagram shows the interactions between the different users (Actors) and the system's core features.

```mermaid
useCaseDiagram
    actor Consumer
    actor Supplier
    actor Admin
    
    package "Smart Ecommerce System" {
        usecase "Browse & Search Products" as UC1
        usecase "Add to Cart & Checkout" as UC2
        usecase "Chat with AI Assistant" as UC3
        usecase "Manage Product Catalog" as UC4
        usecase "View Sales Analytics" as UC5
        usecase "Approve/Reject Products" as UC6
        usecase "Manage Users" as UC7
        usecase "Process Payments (Razorpay)" as UC8
    }
    
    Consumer --> UC1
    Consumer --> UC2
    Consumer --> UC3
    
    Supplier --> UC4
    Supplier --> UC5
    
    Admin --> UC6
    Admin --> UC7
    
    UC2 ..> UC8 : <<includes>>
```

---

## 2. Data Flow Diagrams (DFD)

### DFD Level 0: Context Diagram
The Context Diagram defines the system boundary and its interactions with external entities.

```mermaid
graph LR
    C[Consumer]
    S[Supplier]
    A[Admin]
    R[[Razorpay Gateway]]
    T[[Twilio/Email Service]]
    
    System((Smart Ecommerce Platform))
    
    C -- "Orders/Queries" --> System
    System -- "Products/Responses" --> C
    
    S -- "Inventory Details" --> System
    System -- "Sales Reports" --> S
    
    A -- "Approvals/Config" --> System
    System -- "Audit Logs" --> A
    
    System -- "Payment Req" --> R
    R -- "Payment Conf" --> System
```

### DFD Level 1: Functional Diagram
Level 1 breaks the system into its primary internal processes.

```mermaid
graph TD
    %% Entities
    Consumer([Consumer])
    Supplier([Supplier])
    Admin([Admin])
    Gateway[[External APIs: Razorpay/Twilio/OpenAI]]

    %% Processes
    P1[1.0 Auth & Profile]
    P2[2.0 Catalog Management]
    P3[3.0 Transaction Engine]
    P4[4.0 AI Interaction Layer]
    P5[5.0 Notification Engine]

    %% Data Stores
    D1[(User Data)]
    D2[(Product DB)]
    D3[(Orders & Payments)]

    %% Flow
    Consumer -->|Credentials| P1
    P1 <--> D1
    
    Supplier -->|Upload Items| P2
    P2 <--> D2
    Admin -->|Review| P2
    
    Consumer -->|Checkout| P3
    P3 <--> D3
    P3 <-->|Process| Gateway
    
    P3 -->|Trigger| P5
    P5 -->|Send| Consumer
    
    Consumer -->|Chat/Query| P4
    P4 <--> Gateway
```

---

## 3. Entity Relationship (ER) Diagram
The ER diagram maps the database structure exactly as implemented in your Django backend.

```mermaid
erDiagram
    AppUser ||--o| SupplierProfile : "extends"
    AppUser ||--o| ConsumerProfile : "extends"
    
    Category ||--o{ Product : "contains"
    AppUser ||--o{ Product : "manages (Supplier)"
    
    AppUser ||--o{ Order : "buys"
    Order ||--o{ OrderItem : "contains"
    Product ||--o{ OrderItem : "includes"
    Order ||--o| Payment : "settles"
    
    AppUser ||--o{ ChatbotLog : "query-history"
    Product ||--o| ProductAIScore : "ai-metrics"

    AppUser {
        int id
        string username
        string role
        string phone
    }
    Product {
        string name
        decimal price
        int stock
        string status
    }
    Order {
        int id
        decimal total
        string status
    }
```

---

## 4. Project Development Timeline
A roadmap showing the development history and upcoming phases.

```mermaid
gantt
    title Roadmap: Smart Ecommerce 2026
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Database Schema & Auth      :done, 2026-01-01, 2026-01-20
    Section Phase 2: Core Features
    Product & Order System      :done, 2026-01-21, 2026-02-15
    Payment Gateway Integration :done, 2026-02-16, 2026-03-05
    Section Phase 3: AI & UX
    OpenAI Chatbot & Scoring    :active, 2026-03-06, 2026-04-20
    UI Polish & Animations      : 2026-04-21, 2026-05-05
    Section Phase 4: Final
    Testing & Documentation     : 2026-05-06, 2026-05-20
```

---

## Final Checklist for Your Documentation
*   [x] **Diagram Consistency:** Actors (Consumer, Supplier, Admin) are consistent across all diagrams.
*   [x] **Technical Alignment:** ER Diagram matches the Django models in your `store` and `users` apps.
*   [x] **Integration Accuracy:** DFD reflects real integrations with Razorpay and OpenAI.
