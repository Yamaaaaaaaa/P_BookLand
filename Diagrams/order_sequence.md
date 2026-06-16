# Lược đồ Tuần tự Nghiệp vụ Đơn hàng (Order Workflow Sequence Diagram) - PTIT BookLand

Tài liệu này chứa các lược đồ tuần tự (Sequence Diagram) mô tả quy trình nghiệp vụ Đơn hàng bao gồm: **Tạo hóa đơn**, **Thanh toán trực tuyến (VNPAY)**, và **Duyệt đơn hàng** của hệ thống **PTIT BookLand** bằng cú pháp **Mermaid**.

---

## 1. Tạo hóa đơn (Create Bill)
*Mô tả quy trình khách hàng tiến hành đặt hàng từ giỏ hàng, áp dụng chương trình khuyến mãi tự động (nếu hợp lệ) và khấu trừ tồn kho sách.*

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client (Customer)
    participant Ctrl as BillController
    participant Svc as BillService
    participant UserRepo as UserRepository
    participant SMRepo as ShippingMethodRepository
    participant PMRepo as PaymentMethodRepository
    participant BookRepo as BookRepository
    participant EventApp as EventApplicationService
    participant BillRepo as BillRepository
    participant BillBookRepo as BillBookRepository

    Client->>Ctrl: POST /api/bills (CreateBillRequest)
    activate Ctrl
    Ctrl->>Svc: createBill(CreateBillRequest)
    activate Svc

    %% 1. Retrieve core records
    Svc->>UserRepo: findById(userId)
    activate UserRepo
    UserRepo-->>Svc: User
    deactivate UserRepo

    Svc->>PMRepo: findById(paymentMethodId)
    activate PMRepo
    PMRepo-->>Svc: PaymentMethod
    deactivate PMRepo

    Svc->>SMRepo: findById(shippingMethodId)
    activate SMRepo
    SMRepo-->>Svc: ShippingMethod
    deactivate SMRepo

    %% 2. Calculate temporary subtotal and check stock
    loop Cho mỗi BookRequest trong danh sách đặt mua
        Svc->>BookRepo: findById(bookId)
        activate BookRepo
        BookRepo-->>Svc: Book
        deactivate BookRepo
        
        alt Tồn kho < Số lượng đặt mua
            Svc-->>Ctrl: Throw AppException (BOOK_OUT_OF_STOCK)
            Ctrl-->>Client: 400 Bad Request
        end
        Svc->>Svc: Tính tổng tiền tạm tính & số lượng
    end

    %% 3. Evaluate Promotion/Event
    Svc->>EventApp: getHighestPriorityActiveEvent()
    activate EventApp
    EventApp-->>Svc: Optional~Event~ (Active Event)
    deactivate EventApp

    opt Có sự kiện hoạt động
        Svc->>EventApp: checkEventRule(event, user, tempTotalCost, totalQuantity)
        activate EventApp
        EventApp-->>Svc: boolean (Eligible/Not Eligible)
        deactivate EventApp

        opt Hợp lệ áp dụng khuyến mãi
            Svc->>EventApp: Áp dụng giảm giá (Hóa đơn / Từng sản phẩm / Free ship)
        end
    end

    Svc->>Svc: Tính toán lại tổng tiền cuối cùng (finalCost)

    %% 4. Save Bill & BillBooks & Deduct Stock
    Svc->>BillRepo: save(Bill - status: PENDING)
    activate BillRepo
    BillRepo-->>Svc: Bill (Saved with ID)
    deactivate BillRepo

    loop Cho mỗi Book được đặt mua
        Svc->>BillBookRepo: save(BillBook - priceSnapshot)
        activate BillBookRepo
        BillBookRepo-->>Svc: BillBook (Saved)
        deactivate BillBookRepo

        Svc->>BookRepo: deductStock(bookId, quantity) (Atomic Database Update)
        activate BookRepo
        BookRepo-->>Svc: rowsUpdated (1 = Success, 0 = Concurrent Out of stock)
        deactivate BookRepo
        
        alt rowsUpdated == 0 (Đụng độ đồng thời hết hàng)
            Svc-->>Ctrl: Throw AppException (BOOK_OUT_OF_STOCK)
            Ctrl-->>Client: 400 Bad Request
        end
    end

    opt Có khuyến mãi được áp dụng
        Svc->>EventApp: logEventApplication(event, user, savedBill, discount)
    end

    Svc->>Svc: evictBookCaches() (Xóa cache sách đã giảm tồn kho)
    Svc-->>Ctrl: BillDTO
    deactivate Svc
    Ctrl-->>Client: 200 OK (ApiResponse~BillDTO~)
    deactivate Ctrl
```

---

## 2. Thanh toán trực tuyến (VNPAY Online Payment)
*Quy trình tạo URL thanh toán dẫn sang cổng sandbox VNPAY và xử lý callback nhận kết quả thanh toán từ VNPAY để cập nhật trạng thái hóa đơn tự động.*

### 2.1 Yêu cầu tạo URL thanh toán (Create Payment URL)

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client
    participant Ctrl as PaymentController
    participant BillRepo as BillRepository
    participant TxnRepo as PaymentTransactionRepository
    participant VNPConfig as VnpayConfig

    Client->>Ctrl: POST /api/online-payment/create-payment?billId={id}
    activate Ctrl
    Ctrl->>BillRepo: findById(billId)
    activate BillRepo
    BillRepo-->>Ctrl: Bill
    deactivate BillRepo

    %% Save Pending Transaction
    Ctrl->>TxnRepo: save(PaymentTransaction - status: PENDING)
    activate TxnRepo
    TxnRepo-->>Ctrl: PaymentTransaction
    deactivate TxnRepo

    %% Generate URL Parameters
    Ctrl->>VNPConfig: Build params & hash (TxnRef, SecureHash)
    activate VNPConfig
    VNPConfig-->>Ctrl: paymentUrl
    deactivate VNPConfig

    Ctrl-->>Client: 200 OK (PaymentResponse containing URL)
    deactivate Ctrl
    
    Note over Client, VNPConfig: Client được chuyển hướng sang cổng thanh toán VNPAY thực hiện giao dịch.
```

### 2.2 Xử lý Callback kết quả thanh toán (Handle VNPAY Callback)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant VNP as VNPAY Gateway
    participant Ctrl as PaymentController
    participant VNPConfig as VnpayConfig
    participant TxnRepo as PaymentTransactionRepository
    participant BillRepo as BillRepository

    VNP->>Client: Redirect to FE (with query parameters)
    Client->>Ctrl: GET /api/online-payment/payment_infor?vnp_Amount=...&vnp_ResponseCode=...&vnp_SecureHash=...
    activate Ctrl

    %% Verify Signature
    Ctrl->>VNPConfig: hashAllFields(params)
    activate VNPConfig
    VNPConfig-->>Ctrl: signValue (Checksum)
    deactivate VNPConfig

    alt Checksum không hợp lệ
        Ctrl-->>Client: 200 OK (Invalid Checksum Response)
    else Checksum hợp lệ
        Ctrl->>TxnRepo: findByTransactionCode(vnp_TxnRef)
        activate TxnRepo
        TxnRepo-->>Ctrl: PaymentTransaction
        deactivate TxnRepo

        alt Không tìm thấy Giao dịch
            Ctrl-->>Client: 200 OK (Transaction Not Found Response)
        else Giao dịch hợp lệ
            Ctrl->>Ctrl: Cập nhật thông tin VNPAY (responseCode, transactionNo...)
            
            alt vnp_ResponseCode == "00" (Thành công)
                Ctrl->>Ctrl: Set transactionStatus = SUCCESS
                
                %% Update Bill
                Ctrl->>BillRepo: Cập nhật Bill (status: APPROVED, paymentStatus: SUCCESS, approvedAt: Now)
                activate BillRepo
                BillRepo-->>Ctrl: Bill (Saved)
                deactivate BillRepo
            else Giao dịch thất bại (Khác "00")
                Ctrl->>Ctrl: Set transactionStatus = FAILED
            end

            Ctrl->>TxnRepo: save(PaymentTransaction)
            activate TxnRepo
            TxnRepo-->>Ctrl: PaymentTransaction (Updated)
            deactivate TxnRepo

            Ctrl-->>Client: 200 OK (ApiResponse~PaymentTransactionDTO~)
            deactivate Ctrl
        end
    end
```

---

## 3. Duyệt đơn hàng (Approve Bill)
*Nhân viên vận hành (Admin/Manager/Order Staff) phê duyệt đơn hàng thủ công (ví dụ đối với các đơn hàng thanh toán khi nhận hàng - COD hoặc xử lý sự cố).*

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Admin / Staff (User)
    participant Ctrl as BillController
    participant Svc as BillService
    participant BillRepo as BillRepository
    participant UserRepo as UserRepository
    participant NotiSvc as NotificationService
    participant EmailSvc as EmailService

    Staff->>Ctrl: PATCH /api/bills/{id}/status (UpdateBillStatusRequest - status: APPROVED)
    activate Ctrl
    Ctrl->>Svc: updateBillStatus(id, UpdateBillStatusRequest)
    activate Svc

    Svc->>BillRepo: findById(id)
    activate BillRepo
    BillRepo-->>Svc: Bill
    deactivate BillRepo

    Svc->>Svc: validateStatusTransition(oldStatus, APPROVED)

    Svc->>UserRepo: findById(approvedById)
    activate UserRepo
    UserRepo-->>Svc: User (Approver)
    deactivate UserRepo

    Svc->>Svc: Cập nhật Bill (status: APPROVED, approvedBy: Approver, approvedAt: Now)
    Svc->>BillRepo: save(Bill)
    activate BillRepo
    BillRepo-->>Svc: Bill (Updated)
    deactivate BillRepo

    %% Notifications
    Svc->>NotiSvc: createNotification(customerUserId, "BILL_STATUS", Title, Content, approverId)
    activate NotiSvc
    NotiSvc-->>Svc: Notification (Saved)
    deactivate NotiSvc

    Svc->>EmailSvc: sendEmailWithHtmlTemplate(customerEmail, Title, Template, Model)
    activate EmailSvc
    EmailSvc-->>Svc: Send OK
    deactivate EmailSvc

    Svc-->>Ctrl: BillDTO
    deactivate Svc
    Ctrl-->>Staff: 200 OK (ApiResponse~BillDTO~)
    deactivate Ctrl
```
