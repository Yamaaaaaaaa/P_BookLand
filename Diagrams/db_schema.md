# Lược đồ Cơ sơ dữ liệu (Database Schema) - PTIT BookLand

Tài liệu này chứa lược đồ Cơ sở dữ liệu (ER Diagram) được tinh chỉnh gọn gàng, chia thành sơ đồ tổng quan rút gọn và các phân hệ chi tiết để dễ dàng theo dõi.

---

## 1. Sơ đồ Quan hệ Tổng quan (High-Level ERD)
*Sơ đồ rút gọn thể hiện các mối quan hệ liên kết giữa các bảng trong hệ thống (không bao gồm chi tiết cột để tránh rối mắt).*

```mermaid
erDiagram
    %% --- USER & SECURITY ---
    users ||--o{ address : "has"
    users ||--o{ user_role : "has"
    role ||--o{ user_role : "has"
    role ||--o{ role_permission : "has"
    permission ||--o{ role_permission : "has"

    %% --- CATALOG & SUPPLY ---
    book ||--|| author : "written_by"
    book ||--|| publisher : "published_by"
    book ||--o{ serie : "belongs_to"
    book ||--o{ book_category : "has"
    category ||--o{ book_category : "has"
    book ||--o{ users : "created_by"
    purchase_invoice ||--|| supplier : "supplied_by"
    purchase_invoice ||--|| users : "created_by"
    purchase_invoice ||--o{ purchase_invoice_book : "contains"
    book ||--o{ purchase_invoice_book : "contains"

    %% --- CART & CHECKOUT Flow ---
    cart ||--|| users : "owned_by"
    cart ||--o{ cart_item : "contains"
    book ||--o{ cart_item : "contains"
    bill ||--|| users : "placed_by"
    bill ||--|| payment_method : "paid_with"
    bill ||--|| shipping_method : "shipped_with"
    bill ||--o{ bill_book : "contains"
    book ||--o{ bill_book : "contains"
    bill ||--o{ payment_transaction : "has"
    payment_method ||--o{ payment_transaction : "has"

    %% --- INTERACTIONS & PROMOTIONS ---
    book_comment ||--|| book : "about"
    book_comment ||--|| users : "by"
    book_comment ||--|| bill : "verified_purchase"
    wishlist ||--|| users : "by"
    wishlist ||--|| book : "contains"
    notification ||--o{ users : "sent_to"
    event ||--|| users : "created_by"
    event ||--o{ event_image : "has"
    event ||--o{ event_target : "applies_to"
    event ||--o{ event_rule : "requires"
    event ||--o{ event_action : "triggers"
    event ||--o{ event_log : "records"
    event_log ||--|| users : "by"
    event_log ||--|| bill : "applied_to"

    %% --- CHATBOT AI ---
    chatbot_session ||--|| users : "by"
    chat_message ||--|| chatbot_session : "contains"
    escalation ||--|| chatbot_session : "triggers"
```

---

## 2. Chi tiết theo Phân hệ (Detailed Schema by Modules)

### 2.1 Phân hệ Người dùng & Phân quyền (User & Security)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar firstName
        varchar lastName
        varchar phone
        varchar status
        timestamp createdAt
    }
    role {
        bigint id PK
        varchar name UK
        varchar description
    }
    permission {
        varchar name PK
        varchar description
    }
    user_role {
        bigint userId PK, FK
        bigint roleId PK, FK
    }
    role_permission {
        bigint roleId PK, FK
        varchar permissionId PK, FK
    }
    address {
        bigint id PK
        bigint userId FK
        varchar contactPhone
        text addressDetail
        boolean isDefault
    }
    invalidated_token {
        varchar id PK
        timestamp expiryTime
    }

    users ||--o{ user_role : ""
    role ||--o{ user_role : ""
    role ||--o{ role_permission : ""
    permission ||--o{ role_permission : ""
    users ||--o{ address : ""
```

### 2.2 Phân hệ Sách & Danh mục (Catalog & Inventory)

```mermaid
erDiagram
    book {
        bigint id PK
        varchar name
        double originalCost
        double sale
        int stock
        varchar status
        bigint authorId FK
        bigint publisherId FK
        bigint seriesId FK
        timestamp createdAt
    }
    author {
        bigint id PK
        varchar name
        text description
        text authorImage
    }
    publisher {
        bigint id PK
        varchar name
        varchar phone
    }
    serie {
        bigint id PK
        varchar name
        text description
    }
    category {
        bigint id PK
        varchar name
        text description
    }
    book_category {
        bigint bookId PK, FK
        bigint categoryId PK, FK
    }

    book ||--|| author : ""
    book ||--|| publisher : ""
    book ||--o{ serie : ""
    book ||--o{ book_category : ""
    category ||--o{ book_category : ""
```

### 2.3 Phân hệ Nhập hàng & Nhà cung cấp (Supply Chain)

```mermaid
erDiagram
    supplier {
        bigint id PK
        varchar name
        varchar phone
        varchar email
    }
    purchase_invoice {
        bigint id PK
        bigint supplierId FK
        bigint createdBy FK
        double totalCost
        varchar status
        timestamp createdAt
    }
    purchase_invoice_book {
        bigint purchaseInvoiceId PK, FK
        bigint bookId PK, FK
        int quantity
        double importPrice
    }

    purchase_invoice ||--|| supplier : ""
    purchase_invoice ||--o{ purchase_invoice_book : ""
```

### 2.4 Phân hệ Giỏ hàng & Thanh toán (Cart & Checkout Flow)

```mermaid
erDiagram
    cart {
        bigint id PK
        bigint userId FK
        varchar status
        timestamp updatedAt
    }
    cart_item {
        bigint cartId PK, FK
        bigint bookId PK, FK
        int quantity
    }
    bill {
        bigint id PK
        bigint userId FK
        bigint paymentMethodId FK
        bigint shippingMethodId FK
        double totalCost
        varchar status
        varchar paymentStatus
        timestamp createdAt
    }
    bill_book {
        bigint billId PK, FK
        bigint bookId PK, FK
        double priceSnapshot
        int quantity
    }
    payment_method {
        bigint id PK
        varchar name
        boolean status
    }
    shipping_method {
        bigint id PK
        varchar name
        double cost
    }
    payment_transaction {
        bigint id PK
        bigint billId FK
        double amount
        varchar transactionCode UK
        varchar status
        timestamp paidAt
    }

    cart ||--o{ cart_item : ""
    bill ||--|| payment_method : ""
    bill ||--|| shipping_method : ""
    bill ||--o{ bill_book : ""
    bill ||--o{ payment_transaction : ""
```

### 2.5 Phân hệ Tương tác & Khuyến mãi (Interactions & Events)

```mermaid
erDiagram
    book_comment {
        bigint id PK
        bigint bookId FK
        bigint userId FK
        bigint billId FK
        text comment
        int rating
        timestamp createdAt
    }
    wishlist {
        bigint id PK
        bigint userId FK
        bigint bookId FK
    }
    notification {
        bigint id PK
        bigint toId FK
        varchar type
        varchar title
        varchar status
    }
    event {
        bigint id PK
        varchar name
        varchar type
        timestamp startTime
        timestamp endTime
        varchar status
        int priority
    }
    event_image {
        bigint id PK
        bigint eventId FK
        varchar imageUrl
    }
    event_target {
        bigint id PK
        bigint eventId FK
        varchar targetType
        varchar targetValue
    }
    event_rule {
        bigint id PK
        bigint eventId FK
        varchar ruleType
        varchar ruleValue
    }
    event_action {
        bigint id PK
        bigint eventId FK
        varchar actionType
        double actionValue
    }
    event_log {
        bigint id PK
        bigint eventId FK
        bigint userId FK
        bigint billId FK
        int appliedValue
    }

    event ||--o{ event_image : ""
    event ||--o{ event_target : ""
    event ||--o{ event_rule : ""
    event ||--o{ event_action : ""
    event ||--o{ event_log : ""
```

### 2.6 Trợ lý Chatbot AI & Cấu hình hệ thống (AI & Configurations)

```mermaid
erDiagram
    chatbot_session {
        bigint id PK
        bigint userId FK
        varchar sessionToken
        timestamp lastActiveAt
    }
    chat_message {
        bigint id PK
        bigint sessionId FK
        varchar sender
        text content
        timestamp timestamp
    }
    chatbot_knowledge {
        bigint id PK
        text question
        text answer
        varchar tags
    }
    ai_feedback {
        bigint id PK
        text userQuery
        text aiResponse
        int rating
    }
    escalation {
        bigint id PK
        bigint sessionId FK
        text reason
        varchar status
    }
    app_setting {
        bigint id PK
        varchar settingKey UK
        text settingValue
    }

    chatbot_session ||--o{ chat_message : ""
    chatbot_session ||--o{ escalation : ""
```
