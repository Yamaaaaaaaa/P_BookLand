CREATE VIEW vw_revenue_daily AS
SELECT
  DATE(b.createdAt) AS revenueDate,
  COUNT(DISTINCT b.id) AS totalBills,
  SUM(b.totalCost) AS totalRevenue
FROM Bill b
WHERE b.status IN ('COMPLETED', 'SHIPPED')
GROUP BY DATE(b.createdAt);




CREATE VIEW vw_revenue_monthly AS
SELECT
  YEAR(b.createdAt) AS year,
  MONTH(b.createdAt) AS month,
  SUM(b.totalCost) AS totalRevenue,
  COUNT(DISTINCT b.id) AS totalBills
FROM Bill b
WHERE b.status IN ('COMPLETED', 'SHIPPED')
GROUP BY YEAR(b.createdAt), MONTH(b.createdAt);




CREATE VIEW vw_best_selling_books AS
SELECT
  bk.id AS bookId,
  bk.name AS bookName,
  SUM(bb.quantity) AS totalSold,
  SUM(bb.quantity * bb.priceSnapshot) AS totalRevenue
FROM Bill_Book bb
JOIN Bill b ON b.id = bb.billId
JOIN Book bk ON bk.id = bb.bookId
WHERE b.status IN ('COMPLETED', 'SHIPPED')
GROUP BY bk.id, bk.name
ORDER BY totalSold DESC;



CREATE VIEW vw_inventory_stock AS
SELECT
  b.id AS bookId,
  b.name AS bookName,
  IFNULL(imported.totalImported, 0) AS totalImported,
  IFNULL(sold.totalSold, 0) AS totalSold,
  (IFNULL(imported.totalImported, 0) - IFNULL(sold.totalSold, 0)) AS currentStock
FROM Book b
LEFT JOIN (
  SELECT
    pib.bookId,
    SUM(pib.quantity) AS totalImported
  FROM PurchaseInvoice_Book pib
  JOIN PurchaseInvoice pi ON pi.id = pib.purchaseInvoiceId
  WHERE pi.status = 'COMPLETED'
  GROUP BY pib.bookId
) imported ON imported.bookId = b.id
LEFT JOIN (
  SELECT
    bb.bookId,
    SUM(bb.quantity) AS totalSold
  FROM Bill_Book bb
  JOIN Bill bi ON bi.id = bb.billId
  WHERE bi.status IN ('COMPLETED', 'SHIPPED')
  GROUP BY bb.bookId
) sold ON sold.bookId = b.id;




CREATE VIEW vw_user_order_summary AS
SELECT
  u.id AS userId,
  u.username,
  COUNT(b.id) AS totalOrders,
  SUM(b.totalCost) AS totalSpent
FROM User u
LEFT JOIN Bill b ON b.userId = u.id
  AND b.status IN ('COMPLETED', 'SHIPPED')
GROUP BY u.id, u.username;




CREATE VIEW vw_failed_payments AS
SELECT
  pt.id,
  pt.billId,
  pt.provider,
  pt.amount,
  pt.responseCode,
  pt.responseMessage,
  pt.createdAt
FROM PaymentTransaction pt
WHERE pt.status = 'FAILED';
