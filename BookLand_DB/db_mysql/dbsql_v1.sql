-- ======================================================
-- BOOKLAND DATABASE SCHEMA - FIXED VERSION
-- Database: bookland_test
-- ======================================================

USE bookland_test;

-- Drop tables if exists (in reverse order of dependencies)
DROP TABLE IF EXISTS event_log;
DROP TABLE IF EXISTS event_action;
DROP TABLE IF EXISTS event_rule;
DROP TABLE IF EXISTS event_target;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS purchase_invoice_book;
DROP TABLE IF EXISTS purchase_invoice;
DROP TABLE IF EXISTS supplier;
DROP TABLE IF EXISTS payment_transaction;
DROP TABLE IF EXISTS bill_book;
DROP TABLE IF EXISTS bill;
DROP TABLE IF EXISTS shipping_method;
DROP TABLE IF EXISTS payment_method;
DROP TABLE IF EXISTS book_comment;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS book_category;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS role_permission;
DROP TABLE IF EXISTS user_role;
DROP TABLE IF EXISTS permission;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS serie;
DROP TABLE IF EXISTS publisher;
DROP TABLE IF EXISTS author;

-- ======================================================
-- STEP 1: BASIC ENTITIES
-- ======================================================

CREATE TABLE author (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  authorImage TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE publisher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE serie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 2: USER & AUTH
-- ======================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  dob DATE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status ENUM('ENABLE','DISABLE') NOT NULL DEFAULT 'ENABLE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  contactPhone VARCHAR(50),
  addressDetail TEXT,
  isDefault BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_address_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_role (
  userId INT,
  roleId INT,
  PRIMARY KEY (userId, roleId),
  CONSTRAINT fk_user_role_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_role_role
    FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permission (
  roleId INT,
  permissionId INT,
  PRIMARY KEY (roleId, permissionId),
  CONSTRAINT fk_role_permission_role
    FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permission_permission
    FOREIGN KEY (permissionId) REFERENCES permission(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 3: BOOK
-- ======================================================

CREATE TABLE book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  originalCost INT NOT NULL,
  sale INT DEFAULT 0,
  stock INT DEFAULT 0,
  status ENUM('ENABLE','DISABLE') DEFAULT 'ENABLE',
  publishedDate DATE,
  bookImageUrl TEXT,
  pin BOOLEAN DEFAULT FALSE,
  authorId INT NOT NULL,
  publisherId INT NOT NULL,
  seriesId INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  CONSTRAINT fk_book_author
    FOREIGN KEY (authorId) REFERENCES author(id) ON DELETE RESTRICT,
  CONSTRAINT fk_book_publisher
    FOREIGN KEY (publisherId) REFERENCES publisher(id) ON DELETE RESTRICT,
  CONSTRAINT fk_book_serie
    FOREIGN KEY (seriesId) REFERENCES serie(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_creator
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE book_category (
  bookId INT,
  categoryId INT,
  PRIMARY KEY (bookId, categoryId),
  CONSTRAINT fk_book_category_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_category_category
    FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 4: CART / WISHLIST
-- ======================================================

CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  status ENUM('BUYING','CHECKED_OUT') DEFAULT 'BUYING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_item (
  cartId INT,
  bookId INT,
  quantity INT NOT NULL DEFAULT 1,
  PRIMARY KEY (cartId, bookId),
  CONSTRAINT fk_cart_item_cart
    FOREIGN KEY (cartId) REFERENCES cart(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_item_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  bookId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, bookId),
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 5: REVIEW
-- ======================================================

CREATE TABLE book_comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookId INT NOT NULL,
  userId INT NOT NULL,
  comment TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_comment_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_comment_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 6: BILL / PAYMENT / SHIPPING
-- ======================================================

CREATE TABLE payment_method (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  providerCode VARCHAR(255) NOT NULL,
  isOnline BOOLEAN DEFAULT FALSE,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shipping_method (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bill (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  paymentMethodId INT NOT NULL,
  shippingMethodId INT NOT NULL,
  totalCost INT NOT NULL,
  approvedId INT NULL,
  status ENUM('PENDING','APPROVED','SHIPPING','SHIPPED','COMPLETED','CANCELED') DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approvedAt DATETIME NULL,
  CONSTRAINT fk_bill_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bill_payment
    FOREIGN KEY (paymentMethodId) REFERENCES payment_method(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bill_shipping
    FOREIGN KEY (shippingMethodId) REFERENCES shipping_method(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bill_approved
    FOREIGN KEY (approvedId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bill_book (
  billId INT,
  bookId INT,
  priceSnapshot INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (billId, bookId),
  CONSTRAINT fk_bill_book_bill
    FOREIGN KEY (billId) REFERENCES bill(id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_book_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  billId INT NOT NULL,
  paymentMethodId INT NOT NULL,
  provider VARCHAR(255),
  amount INT NOT NULL,
  transactionCode VARCHAR(255) UNIQUE,
  providerTransactionId VARCHAR(255),
  status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  payUrl TEXT,
  responseCode VARCHAR(255),
  responseMessage TEXT,
  paidAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_transaction_bill
    FOREIGN KEY (billId) REFERENCES bill(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_transaction_method
    FOREIGN KEY (paymentMethodId) REFERENCES payment_method(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 7: NOTIFICATION
-- ======================================================

CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fromId INT,
  toId INT NOT NULL,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status ENUM('UNREAD','READ','ARCHIVED') DEFAULT 'UNREAD',
  readAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_from
    FOREIGN KEY (fromId) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_to
    FOREIGN KEY (toId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 8: EVENT SYSTEM
-- ======================================================

CREATE TABLE event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(255) NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  status ENUM('DRAFT','ACTIVE','PAUSED','EXPIRED','DISABLED') DEFAULT 'DRAFT',
  priority INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_target (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  targetType VARCHAR(255) NOT NULL,
  targetId INT NOT NULL,
  CONSTRAINT fk_event_target_event
    FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_rule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  ruleType VARCHAR(255) NOT NULL,
  ruleValue VARCHAR(255) NOT NULL,
  CONSTRAINT fk_event_rule_event
    FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_action (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  actionType VARCHAR(255) NOT NULL,
  actionValue VARCHAR(255) NOT NULL,
  CONSTRAINT fk_event_action_event
    FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  userId INT,
  billId INT,
  appliedValue INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_log_event
    FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_log_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_log_bill
    FOREIGN KEY (billId) REFERENCES bill(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- STEP 9: SUPPLIER / IMPORT
-- ======================================================

CREATE TABLE supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address VARCHAR(255),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_invoice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT NOT NULL,
  createdBy INT NOT NULL,
  totalCost INT NOT NULL,
  status ENUM('PENDING','COMPLETED','CANCELED') DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_invoice_supplier
    FOREIGN KEY (supplierId) REFERENCES supplier(id) ON DELETE RESTRICT,
  CONSTRAINT fk_purchase_invoice_creator
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_invoice_book (
  purchaseInvoiceId INT,
  bookId INT,
  quantity INT NOT NULL,
  importPrice INT NOT NULL,
  PRIMARY KEY (purchaseInvoiceId, bookId),
  CONSTRAINT fk_purchase_invoice_book_invoice
    FOREIGN KEY (purchaseInvoiceId) REFERENCES purchase_invoice(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_invoice_book_book
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ======================================================

CREATE INDEX idx_book_status ON book(status);
CREATE INDEX idx_book_pin ON book(pin);
CREATE INDEX idx_book_author ON book(authorId);
CREATE INDEX idx_book_publisher ON book(publisherId);
CREATE INDEX idx_book_series ON book(seriesId);
CREATE INDEX idx_bill_status ON bill(status);
CREATE INDEX idx_bill_user ON bill(userId);
CREATE INDEX idx_bill_created ON bill(createdAt);
CREATE INDEX idx_cart_user ON cart(userId);
CREATE INDEX idx_notification_to ON notification(toId);
CREATE INDEX idx_notification_status ON notification(status);
CREATE INDEX idx_event_status ON event(status);
CREATE INDEX idx_event_time ON event(startTime, endTime);