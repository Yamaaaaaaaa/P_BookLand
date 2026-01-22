-- ======================================================
-- STEP 0: DATABASE & CHARSET (OPTIONAL)
-- ======================================================
-- CREATE DATABASE bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE bookstore;

-- ======================================================
-- STEP 1: ENUM DEFINITIONS (INLINE ENUM STYLE - MYSQL)
-- ======================================================

-- UserStatus        : ENABLE, DISABLE
-- BookStatus        : ENABLE, DISABLE
-- CartStatus        : BUYING, CHECKED_OUT
-- BillStatus        : PENDING, APPROVE, SHIPPING, SHIPPED, COMPLETED, CANCELED
-- PurchaseInvoiceStatus : PENDING, COMPLETED
-- PaymentTransactionStatus : PENDING, SUCCESS, FAILED
-- NotificationStatus : UNREAD, READ, ARCHIVED
-- EventStatus       : DRAFT, ACTIVE, PAUSED, EXPIRED, DISABLED

-- ======================================================
-- STEP 2: CORE ENTITIES
-- ======================================================

CREATE TABLE Author (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  description TEXT,
  authorImage TEXT
);

CREATE TABLE Publisher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT
);

CREATE TABLE Serie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  description TEXT
);

CREATE TABLE Category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  description TEXT
);

-- ======================================================
-- STEP 3: USER & AUTH
-- ======================================================

CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  dob DATE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50),
  status ENUM('ENABLE','DISABLE') NOT NULL DEFAULT 'ENABLE',
  createdAt DATETIME
);

CREATE TABLE Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  contactPhone VARCHAR(50),
  addressDetail TEXT,
  isDefault BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_address_user FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE Role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  description TEXT
);

CREATE TABLE Permission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  description TEXT
);

CREATE TABLE User_Role (
  userId INT,
  roleId INT,
  PRIMARY KEY (userId, roleId),
  CONSTRAINT fk_user_role_user FOREIGN KEY (userId) REFERENCES User(id),
  CONSTRAINT fk_user_role_role FOREIGN KEY (roleId) REFERENCES Role(id)
);

CREATE TABLE Role_Permission (
  roleId INT,
  permissionId INT,
  PRIMARY KEY (roleId, permissionId),
  CONSTRAINT fk_role_permission_role FOREIGN KEY (roleId) REFERENCES Role(id),
  CONSTRAINT fk_role_permission_permission FOREIGN KEY (permissionId) REFERENCES Permission(id)
);

-- ======================================================
-- STEP 4: BOOK
-- ======================================================

CREATE TABLE Book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  originalCost INT,
  sale INT,
  stock INT,
  status ENUM('ENABLE','DISABLE') DEFAULT 'ENABLE',
  publishedDate DATE,
  bookImageUrl TEXT,
  pin BOOLEAN DEFAULT FALSE,
  authorId INT,
  publisherId INT,
  seriesId INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  createdBy INT,
  CONSTRAINT fk_book_author FOREIGN KEY (authorId) REFERENCES Author(id),
  CONSTRAINT fk_book_publisher FOREIGN KEY (publisherId) REFERENCES Publisher(id),
  CONSTRAINT fk_book_series FOREIGN KEY (seriesId) REFERENCES Serie(id),
  CONSTRAINT fk_book_creator FOREIGN KEY (createdBy) REFERENCES User(id)
);

CREATE TABLE Book_Category (
  bookId INT,
  categoryId INT,
  PRIMARY KEY (bookId, categoryId),
  CONSTRAINT fk_book_category_book FOREIGN KEY (bookId) REFERENCES Book(id),
  CONSTRAINT fk_book_category_category FOREIGN KEY (categoryId) REFERENCES Category(id)
);

-- ======================================================
-- STEP 5: CART / WISHLIST
-- ======================================================

CREATE TABLE Cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  status ENUM('BUYING','CHECKED_OUT') DEFAULT 'BUYING',
  createdAt DATETIME,
  updatedAt DATETIME,
  CONSTRAINT fk_cart_user FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE Cart_Item (
  cartId INT,
  bookId INT,
  quantity INT,
  PRIMARY KEY (cartId, bookId),
  CONSTRAINT fk_cart_item_cart FOREIGN KEY (cartId) REFERENCES Cart(id),
  CONSTRAINT fk_cart_item_book FOREIGN KEY (bookId) REFERENCES Book(id)
);

CREATE TABLE WishList (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  bookId INT,
  UNIQUE (userId, bookId),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (userId) REFERENCES User(id),
  CONSTRAINT fk_wishlist_book FOREIGN KEY (bookId) REFERENCES Book(id)
);

-- ======================================================
-- STEP 6: REVIEW
-- ======================================================

CREATE TABLE Book_Comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookId INT,
  userId INT,
  comment TEXT,
  rating INT,
  createdAt DATETIME,
  CONSTRAINT fk_comment_book FOREIGN KEY (bookId) REFERENCES Book(id),
  CONSTRAINT fk_comment_user FOREIGN KEY (userId) REFERENCES User(id)
);

-- ======================================================
-- STEP 7: BILL / PAYMENT / SHIPPING
-- ======================================================

CREATE TABLE PaymentMethod (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  providerCode VARCHAR(255),
  isOnline BOOLEAN,
  description TEXT
);

CREATE TABLE ShippingMethod (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT
);

CREATE TABLE Bill (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  paymentMethodId INT,
  shippingMethodId INT,
  totalCost INT,
  status ENUM('PENDING','APPROVE','SHIPPING','SHIPPED','COMPLETED','CANCELED') DEFAULT 'PENDING',
  createdAt DATETIME,
  updatedAt DATETIME,
  CONSTRAINT fk_bill_user FOREIGN KEY (userId) REFERENCES User(id),
  CONSTRAINT fk_bill_payment FOREIGN KEY (paymentMethodId) REFERENCES PaymentMethod(id),
  CONSTRAINT fk_bill_shipping FOREIGN KEY (shippingMethodId) REFERENCES ShippingMethod(id)
);

CREATE TABLE Bill_Book (
  billId INT,
  bookId INT,
  priceSnapshot INT,
  quantity INT,
  PRIMARY KEY (billId, bookId),
  CONSTRAINT fk_bill_book_bill FOREIGN KEY (billId) REFERENCES Bill(id),
  CONSTRAINT fk_bill_book_book FOREIGN KEY (bookId) REFERENCES Book(id)
);

CREATE TABLE PaymentTransaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  billId INT,
  paymentMethodId INT,
  provider VARCHAR(255),
  amount INT,
  transactionCode VARCHAR(255),
  providerTransactionId VARCHAR(255),
  status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  payUrl TEXT,
  responseCode VARCHAR(255),
  responseMessage TEXT,
  paidAt DATETIME,
  createdAt DATETIME,
  CONSTRAINT fk_payment_bill FOREIGN KEY (billId) REFERENCES Bill(id),
  CONSTRAINT fk_payment_method FOREIGN KEY (paymentMethodId) REFERENCES PaymentMethod(id)
);

-- ======================================================
-- STEP 8: NOTIFICATION
-- ======================================================

CREATE TABLE Notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fromId INT,
  toId INT,
  type VARCHAR(255),
  title VARCHAR(255),
  content TEXT,
  status ENUM('UNREAD','READ','ARCHIVED') DEFAULT 'UNREAD',
  readAt DATETIME,
  createdAt DATETIME,
  CONSTRAINT fk_notification_from FOREIGN KEY (fromId) REFERENCES User(id),
  CONSTRAINT fk_notification_to FOREIGN KEY (toId) REFERENCES User(id)
);

-- ======================================================
-- STEP 9: EVENT SYSTEM
-- ======================================================

CREATE TABLE Event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(255),
  startTime DATETIME,
  endTime DATETIME,
  status ENUM('DRAFT','ACTIVE','PAUSED','EXPIRED','DISABLED') DEFAULT 'DRAFT',
  priority INT,
  createdAt DATETIME
);

CREATE TABLE Event_Target (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT,
  targetType VARCHAR(255),
  targetId INT,
  CONSTRAINT fk_event_target_event FOREIGN KEY (eventId) REFERENCES Event(id)
);

CREATE TABLE Event_Rule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT,
  ruleType VARCHAR(255),
  ruleValue VARCHAR(255),
  CONSTRAINT fk_event_rule_event FOREIGN KEY (eventId) REFERENCES Event(id)
);

CREATE TABLE Event_Action (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT,
  actionType VARCHAR(255),
  actionValue VARCHAR(255),
  CONSTRAINT fk_event_action_event FOREIGN KEY (eventId) REFERENCES Event(id)
);

CREATE TABLE Event_Log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT,
  userId INT,
  billId INT,
  appliedValue INT,
  createdAt DATETIME,
  CONSTRAINT fk_event_log_event FOREIGN KEY (eventId) REFERENCES Event(id),
  CONSTRAINT fk_event_log_user FOREIGN KEY (userId) REFERENCES User(id),
  CONSTRAINT fk_event_log_bill FOREIGN KEY (billId) REFERENCES Bill(id)
);

-- ======================================================
-- STEP 10: SUPPLIER / IMPORT
-- ======================================================

CREATE TABLE Supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address VARCHAR(255),
  status VARCHAR(50)
);

CREATE TABLE PurchaseInvoice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT,
  createdBy INT,
  totalCost INT,
  status ENUM('PENDING','COMPLETED') DEFAULT 'PENDING',
  createdAt DATETIME,
  updatedAt DATETIME,
  CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplierId) REFERENCES Supplier(id),
  CONSTRAINT fk_purchase_creator FOREIGN KEY (createdBy) REFERENCES User(id)
);

CREATE TABLE PurchaseInvoice_Book (
  purchaseInvoiceId INT,
  bookId INT,
  quantity INT,
  importPrice INT,
  PRIMARY KEY (purchaseInvoiceId, bookId),
  CONSTRAINT fk_purchase_book_invoice FOREIGN KEY (purchaseInvoiceId) REFERENCES PurchaseInvoice(id),
  CONSTRAINT fk_purchase_book_book FOREIGN KEY (bookId) REFERENCES Book(id)
);






-- ======================================================
-- PRODUCTION INDEX STRATEGY
-- ======================================================

-- =====================
-- USER / AUTH
-- =====================

CREATE INDEX idx_user_status ON User(status);
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_phone ON User(phone);

CREATE INDEX idx_address_user ON Address(userId);

CREATE INDEX idx_user_role_user ON User_Role(userId);
CREATE INDEX idx_user_role_role ON User_Role(roleId);

CREATE INDEX idx_role_permission_role ON Role_Permission(roleId);
CREATE INDEX idx_role_permission_permission ON Role_Permission(permissionId);

-- =====================
-- BOOK
-- =====================

CREATE INDEX idx_book_status ON Book(status);
CREATE INDEX idx_book_author ON Book(authorId);
CREATE INDEX idx_book_publisher ON Book(publisherId);
CREATE INDEX idx_book_series ON Book(seriesId);
CREATE INDEX idx_book_created_at ON Book(createdAt);
CREATE INDEX idx_book_pin_status ON Book(pin, status);

CREATE INDEX idx_book_category_category ON Book_Category(categoryId);

-- =====================
-- CART / WISHLIST
-- =====================

CREATE INDEX idx_cart_user_status ON Cart(userId, status);
CREATE INDEX idx_cart_item_book ON Cart_Item(bookId);

CREATE INDEX idx_wishlist_user ON WishList(userId);

-- =====================
-- REVIEW
-- =====================

CREATE INDEX idx_comment_book ON Book_Comment(bookId);
CREATE INDEX idx_comment_user ON Book_Comment(userId);
CREATE INDEX idx_comment_rating ON Book_Comment(rating);

-- =====================
-- BILL / PAYMENT
-- =====================

CREATE INDEX idx_bill_user_status ON Bill(userId, status);
CREATE INDEX idx_bill_created_at ON Bill(createdAt);
CREATE INDEX idx_bill_payment_method ON Bill(paymentMethodId);
CREATE INDEX idx_bill_shipping_method ON Bill(shippingMethodId);

CREATE INDEX idx_bill_book_book ON Bill_Book(bookId);

CREATE INDEX idx_payment_bill ON PaymentTransaction(billId);
CREATE INDEX idx_payment_status ON PaymentTransaction(status);
CREATE INDEX idx_payment_created_at ON PaymentTransaction(createdAt);

-- =====================
-- NOTIFICATION
-- =====================

CREATE INDEX idx_notification_to_status ON Notification(toId, status);
CREATE INDEX idx_notification_created_at ON Notification(createdAt);

-- =====================
-- EVENT SYSTEM
-- =====================

CREATE INDEX idx_event_status_time ON Event(status, startTime, endTime);

CREATE INDEX idx_event_target_event ON Event_Target(eventId);
CREATE INDEX idx_event_rule_event ON Event_Rule(eventId);
CREATE INDEX idx_event_action_event ON Event_Action(eventId);

CREATE INDEX idx_event_log_event ON Event_Log(eventId);
CREATE INDEX idx_event_log_user ON Event_Log(userId);
CREATE INDEX idx_event_log_bill ON Event_Log(billId);
CREATE INDEX idx_event_log_created_at ON Event_Log(createdAt);

-- =====================
-- SUPPLIER / IMPORT
-- =====================

CREATE INDEX idx_supplier_name ON Supplier(name);

CREATE INDEX idx_purchase_supplier ON PurchaseInvoice(supplierId);
CREATE INDEX idx_purchase_status ON PurchaseInvoice(status);
CREATE INDEX idx_purchase_created_at ON PurchaseInvoice(createdAt);

CREATE INDEX idx_purchase_book_book ON PurchaseInvoice_Book(bookId);
