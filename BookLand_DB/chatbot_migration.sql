-- ======================================================
-- BOOKLAND CHATBOT AI — DATABASE MIGRATION
-- Run this AFTER the main db.sql
-- ======================================================

-- ======================================================
-- STEP 1: Mở rộng bảng chat_message hiện có
-- ======================================================

-- ALTER TABLE chatbot_knowledge ADD FULLTEXT INDEX ft_chatbot_knowledge (title, content, keywords);


-- Cho phép fromUserId NULL (bot reply không có userId)
ALTER TABLE chat_message 
  MODIFY COLUMN from_user_id BIGINT NULL;

-- Thêm các cột chatbot
ALTER TABLE chat_message 
  ADD COLUMN session_id    VARCHAR(36)  NULL
    COMMENT 'UUID chatbot session (null = chat admin thông thường)',
  ADD COLUMN role          ENUM('USER','ASSISTANT','ADMIN','SYSTEM')
    NOT NULL DEFAULT 'USER'
    COMMENT 'USER=khách gửi, ASSISTANT=bot trả lời, ADMIN=admin gửi, SYSTEM=thông báo hệ thống',
  ADD COLUMN content_type  ENUM('TEXT','PRODUCT_CARD','QUICK_REPLY','SYSTEM_NOTICE')
    NOT NULL DEFAULT 'TEXT',
  ADD COLUMN ai_confidence DECIMAL(3,2) NULL
    COMMENT 'Confidence score của bot: 0.00 - 1.00, NULL nếu không phải bot',
  ADD COLUMN metadata      JSON         NULL
    COMMENT 'Extra data: product_ids được gợi ý, quick_reply options, v.v.';

CREATE INDEX idx_chat_session ON chat_message(session_id);
CREATE INDEX idx_chat_role    ON chat_message(role);

-- ======================================================
-- STEP 2: Bảng chatbot_session — Quản lý phiên chat bot
-- ======================================================

CREATE TABLE chatbot_session (
  id             VARCHAR(36)  NOT NULL PRIMARY KEY
    COMMENT 'UUID v4 — tạo phía backend',
  user_id        BIGINT       NULL
    COMMENT 'NULL nếu là guest chưa đăng nhập',
  guest_token    VARCHAR(64)  NULL
    COMMENT 'UUID lưu localStorage của guest (X-Guest-Token header)',
  session_type   ENUM('GUEST','USER') NOT NULL,
  status         ENUM('ACTIVE','ESCALATED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
  started_at     DATETIME     NOT NULL DEFAULT NOW(),
  last_activity  DATETIME     NOT NULL DEFAULT NOW(),
  closed_at      DATETIME     NULL,
  message_count  INT          NOT NULL DEFAULT 0,

  CONSTRAINT fk_chatbot_session_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_session_user     (user_id),
  INDEX idx_session_guest    (guest_token),
  INDEX idx_session_status   (status),
  INDEX idx_session_activity (last_activity)
) COMMENT = 'Lưu trạng thái phiên chat với chatbot AI';

-- ======================================================
-- STEP 3: Bảng escalation — Yêu cầu chuyển tiếp sang admin
-- ======================================================

CREATE TABLE escalation (
  id           VARCHAR(36) NOT NULL PRIMARY KEY
    COMMENT 'UUID v4',
  session_id   VARCHAR(36) NOT NULL,
  user_id      BIGINT      NULL,
  admin_id     BIGINT      NULL
    COMMENT 'Admin được gán xử lý',

  -- Lý do escalation (AI tự phát hiện hoặc user yêu cầu)
  reason       ENUM(
    'USER_REQUEST',       -- Khách chủ động bấm "Gặp admin"
    'LOW_CONFIDENCE',     -- Bot confidence < 0.65
    'REPEATED_QUESTION',  -- Khách hỏi cùng vấn đề 3+ lần
    'COMPLAINT',          -- Bot phát hiện tone khiếu nại
    'OUT_OF_SCOPE'        -- Chủ đề ngoài phạm vi bot
  ) NOT NULL,

  -- Phân loại do AI tự động gán
  category     ENUM(
    'PRODUCT_ADVICE',   -- Tư vấn sản phẩm
    'COMPLAINT',        -- Khiếu nại
    'ORDER_INQUIRY',    -- Hỏi thông tin đơn hàng
    'PAYMENT',          -- Vấn đề thanh toán
    'SHIPPING',         -- Vấn đề giao hàng
    'ADMIN_REQUEST',    -- Khách muốn gặp người thật
    'OTHER'
  ) NOT NULL DEFAULT 'OTHER',

  priority     ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  status       ENUM('PENDING','ASSIGNED','RESOLVED','CLOSED') NOT NULL DEFAULT 'PENDING',

  -- Nội dung do AI tạo ra
  ai_summary   TEXT NULL COMMENT 'AI tóm tắt hội thoại để admin đọc nhanh',
  ai_suggestion TEXT NULL COMMENT 'AI gợi ý câu trả lời cho admin',

  created_at   DATETIME NOT NULL DEFAULT NOW(),
  assigned_at  DATETIME NULL,
  resolved_at  DATETIME NULL,

  CONSTRAINT fk_escalation_session
    FOREIGN KEY (session_id) REFERENCES chatbot_session(id),
  CONSTRAINT fk_escalation_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_escalation_admin
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_escalation_status   (status),
  INDEX idx_escalation_admin    (admin_id),
  INDEX idx_escalation_priority (priority, created_at),
  INDEX idx_escalation_created  (created_at)
) COMMENT = 'Yêu cầu chuyển tiếp từ chatbot sang admin';

-- ======================================================
-- STEP 4: Bảng chatbot_knowledge — Knowledge Base cho RAG
-- ======================================================

CREATE TABLE chatbot_knowledge (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  category   ENUM(
    'POLICY_RETURN',    -- Chính sách đổi trả
    'POLICY_SHIPPING',  -- Chính sách giao hàng
    'POLICY_PAYMENT',   -- Chính sách thanh toán
    'FAQ_ORDER',        -- FAQ đặt hàng
    'FAQ_ACCOUNT',      -- FAQ tài khoản
    'PROMOTION',        -- Khuyến mãi
    'ABOUT'             -- Thông tin cửa hàng
  ) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT         NOT NULL,
  keywords   VARCHAR(500) NULL
    COMMENT 'Từ khóa tìm kiếm, phân cách bằng dấu phẩy',
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  priority   INT          NOT NULL DEFAULT 0
    COMMENT 'Số cao hơn = ưu tiên hiển thị trước',
  created_at DATETIME     NOT NULL DEFAULT NOW(),
  updated_at DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),

  INDEX     idx_kb_category (category, is_active),
  FULLTEXT  INDEX ft_kb_content (title, content, keywords)
) COMMENT = 'Knowledge base cho chatbot — admin có thể CRUD';

-- ======================================================
-- STEP 5: Bảng ai_feedback — Đánh giá chất lượng bot
-- ======================================================

CREATE TABLE ai_feedback (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  message_id    BIGINT      NOT NULL
    COMMENT 'ID của chat_message được đánh giá (role=assistant)',
  session_id    VARCHAR(36) NOT NULL,
  feedback_type ENUM('THUMBS_UP','THUMBS_DOWN','FLAGGED') NOT NULL,
  comment       TEXT        NULL,
  created_at    DATETIME    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_feedback_message
    FOREIGN KEY (message_id) REFERENCES chat_message(id),

  INDEX idx_feedback_session (session_id),
  INDEX idx_feedback_type    (feedback_type)
) COMMENT = 'Đánh giá 👍/👎 cho từng câu trả lời của bot';

-- ======================================================
-- STEP 6: Seed data — Knowledge Base mẫu
-- ======================================================

INSERT INTO chatbot_knowledge (category, title, content, keywords, priority) VALUES
(
  'POLICY_RETURN',
  'Chính sách đổi trả sách',
  'BookLand hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện sau:\n- Sản phẩm bị lỗi do nhà sản xuất (bìa rách, trang thiếu, in lỗi)\n- Sản phẩm không đúng với mô tả trên website\n- Sản phẩm bị hư hỏng trong quá trình vận chuyển\n\nQuy trình đổi trả:\n1. Liên hệ admin qua chat hoặc hotline để tạo yêu cầu đổi trả\n2. Chụp ảnh sản phẩm lỗi và gửi kèm\n3. Admin xét duyệt trong 1-2 ngày làm việc\n4. Sản phẩm mới được giao trong 3-5 ngày sau khi duyệt\n\nLưu ý: Không hỗ trợ đổi trả nếu sách đã bị viết, gạch chân hoặc hư hỏng do người dùng.',
  'đổi trả, hoàn tiền, sách lỗi, bảo hành, refund, return',
  10
),
(
  'POLICY_SHIPPING',
  'Chính sách giao hàng',
  'BookLand cung cấp các hình thức giao hàng sau:\n\n📦 Giao hàng tiêu chuẩn:\n- Phí: 25,000đ cho đơn dưới 150,000đ\n- MIỄN PHÍ cho đơn từ 150,000đ trở lên\n- Thời gian: 3-5 ngày làm việc (nội thành), 5-7 ngày (tỉnh thành khác)\n\n⚡ Giao hàng nhanh:\n- Phí: 45,000đ\n- Thời gian: 1-2 ngày làm việc (chỉ áp dụng nội thành HCM và Hà Nội)\n\nCác đơn vị vận chuyển: GHN, GHTK, Viettel Post\n\nThời gian xử lý đơn: Đơn đặt trước 15:00 sẽ được xử lý trong ngày. Đơn sau 15:00 xử lý ngày hôm sau.',
  'giao hàng, ship, vận chuyển, phí ship, miễn phí giao hàng, thời gian giao',
  10
),
(
  'POLICY_PAYMENT',
  'Chính sách thanh toán',
  'BookLand hỗ trợ các hình thức thanh toán:\n\n💳 Thanh toán online:\n- VNPay (thẻ ATM, thẻ quốc tế Visa/Mastercard, QR Code)\n- Momo (chuyển khoản ngân hàng, ví điện tử)\n\n💵 Thanh toán khi nhận hàng (COD):\n- Áp dụng cho tất cả đơn hàng\n- Thanh toán bằng tiền mặt khi nhận\n\nHóa đơn điện tử sẽ được gửi vào email sau khi thanh toán thành công.',
  'thanh toán, payment, vnpay, momo, COD, tiền mặt, thẻ ngân hàng',
  9
),
(
  'FAQ_ORDER',
  'Hướng dẫn đặt hàng',
  'Cách đặt hàng tại BookLand:\n\n1. Tìm sách: Dùng thanh tìm kiếm hoặc browse theo thể loại\n2. Thêm vào giỏ: Bấm nút "Thêm vào giỏ hàng"\n3. Xem giỏ hàng: Bấm biểu tượng giỏ hàng góc phải\n4. Thanh toán: Bấm "Đặt hàng", điền địa chỉ và chọn phương thức thanh toán\n5. Xác nhận: Bạn sẽ nhận email xác nhận đơn hàng\n\nĐể theo dõi đơn hàng: Vào "Đơn hàng của tôi" trong tài khoản.',
  'đặt hàng, mua sách, giỏ hàng, checkout, order',
  8
),
(
  'FAQ_ACCOUNT',
  'Hướng dẫn tạo tài khoản',
  'Tạo tài khoản BookLand:\n\n1. Bấm "Đăng ký" góc trên phải màn hình\n2. Điền thông tin: họ tên, email, mật khẩu\n3. Xác nhận email (check hộp thư)\n4. Đăng nhập và bắt đầu mua sắm!\n\nLợi ích khi có tài khoản:\n✅ Lưu lịch sử đơn hàng\n✅ Wishlist sách yêu thích\n✅ Nhận thông báo khuyến mãi\n✅ Đánh giá và bình luận sách\n✅ Chat với admin và bot hỗ trợ',
  'tài khoản, đăng ký, register, login, đăng nhập',
  7
),
(
  'ABOUT',
  'Thông tin về BookLand',
  'BookLand là website bán sách và truyện online uy tín tại Việt Nam.\n\n📚 Danh mục đa dạng: Sách giáo khoa, văn học, khoa học, truyện tranh, manga, light novel\n🏷️ Giá cả cạnh tranh: Cam kết giá tốt nhất thị trường\n🚀 Giao hàng nhanh: Toàn quốc\n✅ Chất lượng đảm bảo: 100% sách chính hãng, có hóa đơn\n\nHotline hỗ trợ: [Liên hệ Admin qua chat]\nGiờ làm việc: 8:00 - 22:00 hàng ngày',
  'bookland, thông tin cửa hàng, giới thiệu, hotline, liên hệ',
  5
);
