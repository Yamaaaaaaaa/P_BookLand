-- ======================================================
-- BOOKLAND DATABASE - INSERT DATA (FIXED VERSION)
-- Database: bookland_test
-- ======================================================

USE bookland_db;
 
-- ===============================b=======================
-- BƯỚC 1: INSERT author (Tác giả)
-- ======================================================
INSERT INTO author (name, description, author_image) VALUES
('J.K. Rowling', 'Tác giả người Anh, nổi tiếng với series Harry Potter', 'jk_rowling.jpg'),
('Fujiko F. Fujio', 'Bút danh của Hiroshi Fujimoto, tác giả truyện Doraemon', 'fujiko.jpg'),
('Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm thiếu nhi', 'nguyen_nhat_anh.jpg'),
('Bộ Giáo dục và Đào tạo', 'Tác giả các sách giáo khoa Việt Nam', 'bgddt.jpg');

-- ======================================================
-- BƯỚC 2: INSERT publisher (Nhà xuất bản)
-- ======================================================
INSERT INTO publisher (name, description) VALUES
('NXB Kim Đồng', 'Nhà xuất bản chuyên sách thiếu nhi Việt Nam'),
('NXB Trẻ', 'Nhà xuất bản văn học và thiếu nhi'),
('NXB Giáo dục Việt Nam', 'Nhà xuất bản sách giáo khoa'),
('Bloomsbury Publishing', 'Nhà xuất bản Harry Potter bản tiếng Anh');

-- ======================================================
-- BƯỚC 3: INSERT serie (Bộ sách)
-- ======================================================
INSERT INTO serie (name, description) VALUES
('Harry Potter', 'Bộ tiểu thuyết giả tưởng 7 tập về phù thủy Harry Potter'),
('Doraemon', 'Bộ truyện tranh dài về chú mèo máy đến từ tương lai'),
('Sách Giáo Khoa Lớp 1', 'Bộ sách giáo khoa lớp 1'),
('Sách Giáo Khoa Lớp 2', 'Bộ sách giáo khoa lớp 2'),
('Sách Giáo Khoa Lớp 3', 'Bộ sách giáo khoa lớp 3'),
('Sách Giáo Khoa Lớp 4', 'Bộ sách giáo khoa lớp 4'),
('Sách Giáo Khoa Lớp 5', 'Bộ sách giáo khoa lớp 5'),
('Sách Giáo Khoa Lớp 6', 'Bộ sách giáo khoa lớp 6'),
('Sách Giáo Khoa Lớp 7', 'Bộ sách giáo khoa lớp 7'),
('Sách Giáo Khoa Lớp 8', 'Bộ sách giáo khoa lớp 8'),
('Sách Giáo Khoa Lớp 9', 'Bộ sách giáo khoa lớp 9'),
('Sách Giáo Khoa Lớp 10', 'Bộ sách giáo khoa lớp 10'),
('Sách Giáo Khoa Lớp 11', 'Bộ sách giáo khoa lớp 11'),
('Sách Giáo Khoa Lớp 12', 'Bộ sách giáo khoa lớp 12');

-- ======================================================
-- BƯỚC 4: INSERT category (Thể loại)
-- ======================================================
INSERT INTO category (name, description) VALUES
('Tiểu thuyết giả tưởng', 'Sách thuộc thể loại giả tưởng, phép thuật'),
('Truyện tranh', 'Manga, Comic'),
('Văn học thiếu nhi', 'Sách dành cho thiếu nhi'),
('Sách giáo khoa', 'Sách giáo khoa phổ thông'),
('Văn học Việt Nam', 'Tác phẩm văn học của tác giả Việt Nam');

-- ======================================================
-- BƯỚC 5: INSERT users (2 tài khoản)
-- ======================================================
INSERT INTO users (username, first_name, last_name, dob, email, password, phone, status, created_at) VALUES
-- ('admin', 'Admin', 'System', '1990-01-01', 'admin@gmail.com', '$2a$10$hashed_password_admin', '0901234567', 'ENABLE', NOW()),
('user', 'User', 'Test', '1995-05-15', 'user@gmail.com', '$2a$10$hashed_password_user', '0907654321', 'ENABLE', NOW());

-- -- ======================================================
-- -- BƯỚC 6: INSERT role
-- -- ======================================================
-- INSERT INTO role (name, description) VALUES
-- ('ADMIN', 'Quản trị viên hệ thống'),
-- ('USER', 'Người dùng thông thường');

-- -- ======================================================
-- -- BƯỚC 7: INSERT user_role (Gán role cho user)
-- -- ======================================================
-- INSERT INTO user_role (user_id, role_id) VALUES
-- (1, 1), 
-- (2, 2); 

-- ======================================================
-- BƯỚC 8: INSERT book - HARRY POTTER (7 tập)
-- ======================================================
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Harry Potter và Hòn đá Phù thủy', 'Tập 1: Harry Potter khám phá thế giới phù thuật', 120000, 10, 50, 'ENABLE', '1997-06-26', 'hp1.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Phòng chứa Bí mật', 'Tập 2: Bí mật trong trường Hogwarts', 130000, 10, 45, 'ENABLE', '1998-07-02', 'hp2.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Tên tù nhân ngục Azkaban', 'Tập 3: Sirius Black trốn thoát', 135000, 10, 40, 'ENABLE', '1999-07-08', 'hp3.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Chiếc cốc lửa', 'Tập 4: Giải đấu Tam Pháp thuật', 150000, 10, 35, 'ENABLE', '2000-07-08', 'hp4.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Hội Phượng Hoàng', 'Tập 5: Sự trở lại của Voldemort', 160000, 10, 30, 'ENABLE', '2003-06-21', 'hp5.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Hoàng tử lai', 'Tập 6: Bí mật về Voldemort', 155000, 10, 25, 'ENABLE', '2005-07-16', 'hp6.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1),
('Harry Potter và Bảo bối Tử thần', 'Tập 7: Trận chiến cuối cùng', 170000, 10, 20, 'ENABLE', '2007-07-21', 'hp7.jpg', TRUE, 1, 1, 1, NOW(), NOW(), 1);

-- ======================================================
-- BƯỚC 9: INSERT book - DORAEMON (45 tập truyện dài)
-- ======================================================
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Doraemon - Truyện dài - Tập 1: Khủng long của Nobita', 'Nobita tìm thấy trứng khủng long', 25000, 5, 100, 'ENABLE', '1980-01-01', 'dora_td1.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 2: Lịch sử khai phá vũ trụ', 'Cuộc phiêu lưu ngoài vũ trụ', 25000, 5, 95, 'ENABLE', '1981-01-01', 'dora_td2.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 3: Lâu đài dưới đáy biển', 'Khám phá đại dương', 25000, 5, 90, 'ENABLE', '1983-01-01', 'dora_td3.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 4: Xứ sở ma thuật', 'Thế giới phép thuật kỳ diệu', 25000, 5, 88, 'ENABLE', '1984-01-01', 'dora_td4.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 5: Chuyến phiêu lưu ở miền Tây hoang dã', 'Cuộc phiêu lưu miền Viễn Tây', 25000, 5, 85, 'ENABLE', '1982-01-01', 'dora_td5.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 6: Cuộc đại thủy chiến ở xứ sở người cá', 'Thế giới dưới nước', 25000, 5, 82, 'ENABLE', '1983-03-01', 'dora_td6.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 7: Binh đoàn người sắt', 'Robot xâm lược Trái Đất', 25000, 5, 80, 'ENABLE', '1986-01-01', 'dora_td7.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 8: Những hiệp sĩ không gian', 'Chiến đấu trong vũ trụ', 25000, 5, 78, 'ENABLE', '1985-01-01', 'dora_td8.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 9: Vua quỷ ở thành phố ngầm', 'Thế giới ngầm bí ẩn', 25000, 5, 76, 'ENABLE', '1983-08-01', 'dora_td9.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 10: Cuộc chiến ở xứ sở người bé nhỏ', 'Nobita bị teo nhỏ', 25000, 5, 74, 'ENABLE', '1985-03-01', 'dora_td10.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 11: Cuộc phiêu lưu vào rừng xanh', 'Phiêu lưu trong rừng nhiệt đới', 25000, 5, 72, 'ENABLE', '1992-01-01', 'dora_td11.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 12: Vương quốc trên mây', 'Thế giới trên mây', 25000, 5, 70, 'ENABLE', '1992-03-01', 'dora_td12.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 13: Mê cung thiếc', 'Cuộc phiêu lưu trong mê cung', 25000, 5, 68, 'ENABLE', '1993-01-01', 'dora_td13.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 14: Những vị thần bí ẩn', 'Hành tinh thần bí', 25000, 5, 66, 'ENABLE', '1997-01-01', 'dora_td14.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 15: Cuộc phiêu lưu ở Xứ sở Nghìn lẻ một đêm', 'Thế giới Nghìn lẻ một đêm', 25000, 5, 64, 'ENABLE', '1991-01-01', 'dora_td15.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 16: Chuyến tàu tốc hành ngân hà', 'Du hành vũ trụ bằng tàu hỏa', 25000, 5, 62, 'ENABLE', '1996-01-01', 'dora_td16.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 17: Truyền thuyết về vua mặt trời', 'Khám phá nền văn minh cổ đại', 25000, 5, 60, 'ENABLE', '2000-01-01', 'dora_td17.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 18: Lịch sử khai phá miền Tây', 'Lập nghiệp ở miền Tây', 25000, 5, 58, 'ENABLE', '2001-01-01', 'dora_td18.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 19: Cuộc chiến ngoài hành tinh', 'Chiến đấu với người ngoài hành tinh', 25000, 5, 56, 'ENABLE', '1985-08-01', 'dora_td19.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 20: Viện bảo tàng bảo bối bí mật', 'Kho báu bí ẩn của Doraemon', 25000, 5, 54, 'ENABLE', '2013-01-01', 'dora_td20.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 21: Hòn đảo kỳ bí', 'Phiêu lưu trên đảo hoang', 25000, 5, 52, 'ENABLE', '1998-01-01', 'dora_td21.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 22: Nobita và những bạn khủng long mới', 'Gặp lại những chú khủng long', 25000, 5, 50, 'ENABLE', '2006-01-01', 'dora_td22.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 23: Cuộc phiêu lưu trên đảo giấu vàng', 'Tìm kho báu trên đảo', 25000, 5, 48, 'ENABLE', '2018-01-01', 'dora_td23.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 24: Chú chó của Nobita và cuộc phiêu lưu châu Phi', 'Phiêu lưu ở châu Phi', 25000, 5, 46, 'ENABLE', '1998-03-01', 'dora_td24.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 25: Nobita ở vương quốc Rô-bốt', 'Thế giới robot', 25000, 5, 44, 'ENABLE', '2002-01-01', 'dora_td25.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 26: Nobita và hành tinh màu tím', 'Hành tinh bí ẩn', 25000, 5, 42, 'ENABLE', '1990-01-01', 'dora_td26.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 27: Nobita và binh đoàn người sắt mới', 'Phần tiếp theo binh đoàn người sắt', 25000, 5, 40, 'ENABLE', '2011-01-01', 'dora_td27.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 28: Người cá ngoài đại dương', 'Đại dương xanh thẳm', 25000, 5, 38, 'ENABLE', '2010-01-01', 'dora_td28.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 29: Nobita và chuyến thám hiểm Nam Cực', 'Khám phá Nam Cực', 25000, 5, 36, 'ENABLE', '2017-01-01', 'dora_td29.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 30: Người sinh sống trên mặt trăng', 'Cuộc sống trên mặt trăng', 25000, 5, 34, 'ENABLE', '2019-01-01', 'dora_td30.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 31: Nobita và chuyến tàu thời gian', 'Du hành xuyên thời gian', 25000, 5, 32, 'ENABLE', '1987-01-01', 'dora_td31.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 32: Nobita và những dũng sĩ có cánh', 'Thế giới có cánh', 25000, 5, 30, 'ENABLE', '2001-03-01', 'dora_td32.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 33: Nobita và hành tinh động vật', 'Hành tinh của động vật', 25000, 5, 28, 'ENABLE', '1990-03-01', 'dora_td33.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 34: Nobita và vùng đất lý tưởng trên bầu trời', 'Xây dựng thiên đường', 25000, 5, 26, 'ENABLE', '2016-01-01', 'dora_td34.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 35: Nobita và người khổng lồ xanh', 'Cuộc phiêu lưu với người khổng lồ', 25000, 5, 24, 'ENABLE', '2008-01-01', 'dora_td35.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 36: Nobita và chuyến du hành biển phương Nam', 'Thám hiểm biển phương Nam', 25000, 5, 22, 'ENABLE', '1998-08-01', 'dora_td36.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 37: Nobita và những hiệp sĩ rô-bốt', 'Hiệp sĩ thời đại mới', 25000, 5, 20, 'ENABLE', '2014-01-01', 'dora_td37.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 38: Nobita và Nước Nhật thời nguyên thủy', 'Du hành về thời tiền sử', 25000, 5, 18, 'ENABLE', '1989-01-01', 'dora_td38.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 39: Nobita và Chú khủng long mới', 'Chú khủng long được sinh ra', 25000, 5, 16, 'ENABLE', '2020-01-01', 'dora_td39.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 40: Nobita và những thợ săn vàng', 'Săn tìm kho báu', 25000, 5, 14, 'ENABLE', '1994-01-01', 'dora_td40.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 41: Nobita và vương quốc trên mây', 'Tái hiện vương quốc trên mây', 25000, 5, 12, 'ENABLE', '2023-01-01', 'dora_td41.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 42: Nobita và bản giao hưởng Địa Cầu', 'Cứu lấy Trái Đất', 25000, 5, 10, 'ENABLE', '2024-01-01', 'dora_td42.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 43: Nobita ở đảo giấu vàng', 'Phiên bản mới đảo giấu vàng', 25000, 5, 8, 'ENABLE', '2018-08-01', 'dora_td43.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 44: Nobita và Mặt Trăng phiêu lưu ký', 'Phiêu lưu trên mặt trăng', 25000, 5, 6, 'ENABLE', '2019-08-01', 'dora_td44.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1),
('Doraemon - Truyện dài - Tập 45: Nobita và cuộc đại thủy chiến', 'Chiến đấu dưới nước', 25000, 5, 4, 'ENABLE', '2010-08-01', 'dora_td45.jpg', FALSE, 2, 1, 2, NOW(), NOW(), 1);

-- ======================================================
-- BƯỚC 10: INSERT book - SÁCH GIÁO KHOA LỚP 1-12
-- ======================================================

-- Lớp 1
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 1', 'Sách giáo khoa Toán lớp 1', 15000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_toan1.jpg', FALSE, 4, 3, 3, NOW(), NOW(), 1),
('Tiếng Việt 1', 'Sách giáo khoa Tiếng Việt lớp 1', 20000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_tv1.jpg', FALSE, 4, 3, 3, NOW(), NOW(), 1);

-- Lớp 2
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 2', 'Sách giáo khoa Toán lớp 2', 15000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_toan2.jpg', FALSE, 4, 3, 4, NOW(), NOW(), 1),
('Tiếng Việt 2', 'Sách giáo khoa Tiếng Việt lớp 2', 20000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_tv2.jpg', FALSE, 4, 3, 4, NOW(), NOW(), 1);

-- Lớp 3
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 3', 'Sách giáo khoa Toán lớp 3', 16000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_toan3.jpg', FALSE, 4, 3, 5, NOW(), NOW(), 1),
('Tiếng Việt 3', 'Sách giáo khoa Tiếng Việt lớp 3', 21000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_tv3.jpg', FALSE, 4, 3, 5, NOW(), NOW(), 1),
('Lịch Sử và Địa lý 3', 'Sách giáo khoa Lịch Sử và Địa lý lớp 3', 18000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_ls3.jpg', FALSE, 4, 3, 5, NOW(), NOW(), 1);

-- Lớp 4
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 4', 'Sách giáo khoa Toán lớp 4', 17000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_toan4.jpg', FALSE, 4, 3, 6, NOW(), NOW(), 1),
('Tiếng Việt 4', 'Sách giáo khoa Tiếng Việt lớp 4', 22000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_tv4.jpg', FALSE, 4, 3, 6, NOW(), NOW(), 1),
('Lịch Sử và Địa lý 4', 'Sách giáo khoa Lịch Sử và Địa lý lớp 4', 19000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_ls4.jpg', FALSE, 4, 3, 6, NOW(), NOW(), 1);

-- Lớp 5
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 5', 'Sách giáo khoa Toán lớp 5', 18000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_toan5.jpg', FALSE, 4, 3, 7, NOW(), NOW(), 1),
('Tiếng Việt 5', 'Sách giáo khoa Tiếng Việt lớp 5', 23000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_tv5.jpg', FALSE, 4, 3, 7, NOW(), NOW(), 1),
('Lịch Sử và Địa lý 5', 'Sách giáo khoa Lịch Sử và Địa lý lớp 5', 20000, 0, 200, 'ENABLE', '2020-06-01', 'sgk_ls5.jpg', FALSE, 4, 3, 7, NOW(), NOW(), 1);

-- Lớp 6
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 6', 'Sách giáo khoa Toán lớp 6', 25000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_toan6.jpg', FALSE, 4, 3, 8, NOW(), NOW(), 1),
('Ngữ Văn 6', 'Sách giáo khoa Ngữ Văn lớp 6', 28000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_van6.jpg', FALSE, 4, 3, 8, NOW(), NOW(), 1),
('Lịch Sử 6', 'Sách giáo khoa Lịch Sử lớp 6', 22000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ls6.jpg', FALSE, 4, 3, 8, NOW(), NOW(), 1);

-- Lớp 7
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 7', 'Sách giáo khoa Toán lớp 7', 26000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_toan7.jpg', FALSE, 4, 3, 9, NOW(), NOW(), 1),
('Ngữ Văn 7', 'Sách giáo khoa Ngữ Văn lớp 7', 29000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_van7.jpg', FALSE, 4, 3, 9, NOW(), NOW(), 1),
('Lịch Sử 7', 'Sách giáo khoa Lịch Sử lớp 7', 23000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ls7.jpg', FALSE, 4, 3, 9, NOW(), NOW(), 1);

-- Lớp 8
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 8', 'Sách giáo khoa Toán lớp 8', 27000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_toan8.jpg', FALSE, 4, 3, 10, NOW(), NOW(), 1),
('Ngữ Văn 8', 'Sách giáo khoa Ngữ Văn lớp 8', 30000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_van8.jpg', FALSE, 4, 3, 10, NOW(), NOW(), 1),
('Lịch Sử 8', 'Sách giáo khoa Lịch Sử lớp 8', 24000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ls8.jpg', FALSE, 4, 3, 10, NOW(), NOW(), 1),
('Vật Lý 8', 'Sách giáo khoa Vật Lý lớp 8', 25000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ly8.jpg', FALSE, 4, 3, 10, NOW(), NOW(), 1);

-- Lớp 9
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 9', 'Sách giáo khoa Toán lớp 9', 28000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_toan9.jpg', FALSE, 4, 3, 11, NOW(), NOW(), 1),
('Ngữ Văn 9', 'Sách giáo khoa Ngữ Văn lớp 9', 31000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_van9.jpg', FALSE, 4, 3, 11, NOW(), NOW(), 1),
('Lịch Sử 9', 'Sách giáo khoa Lịch Sử lớp 9', 25000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ls9.jpg', FALSE, 4, 3, 11, NOW(), NOW(), 1),
('Vật Lý 9', 'Sách giáo khoa Vật Lý lớp 9', 26000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_ly9.jpg', FALSE, 4, 3, 11, NOW(), NOW(), 1),
('Hóa Học 9', 'Sách giáo khoa Hóa Học lớp 9', 26000, 0, 180, 'ENABLE', '2020-06-01', 'sgk_hoa9.jpg', FALSE, 4, 3, 11, NOW(), NOW(), 1);

-- Lớp 10
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 10', 'Sách giáo khoa Toán lớp 10', 32000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_toan10.jpg', FALSE, 4, 3, 12, NOW(), NOW(), 1),
('Ngữ Văn 10', 'Sách giáo khoa Ngữ Văn lớp 10', 35000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_van10.jpg', FALSE, 4, 3, 12, NOW(), NOW(), 1),
('Lịch Sử 10', 'Sách giáo khoa Lịch Sử lớp 10', 30000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ls10.jpg', FALSE, 4, 3, 12, NOW(), NOW(), 1),
('Vật Lý 10', 'Sách giáo khoa Vật Lý lớp 10', 31000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ly10.jpg', FALSE, 4, 3, 12, NOW(), NOW(), 1),
('Hóa Học 10', 'Sách giáo khoa Hóa Học lớp 10', 31000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_hoa10.jpg', FALSE, 4, 3, 12, NOW(), NOW(), 1);

-- Lớp 11
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 11', 'Sách giáo khoa Toán lớp 11', 33000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_toan11.jpg', FALSE, 4, 3, 13, NOW(), NOW(), 1),
('Ngữ Văn 11', 'Sách giáo khoa Ngữ Văn lớp 11', 36000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_van11.jpg', FALSE, 4, 3, 13, NOW(), NOW(), 1),
('Lịch Sử 11', 'Sách giáo khoa Lịch Sử lớp 11', 31000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ls11.jpg', FALSE, 4, 3, 13, NOW(), NOW(), 1),
('Vật Lý 11', 'Sách giáo khoa Vật Lý lớp 11', 32000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ly11.jpg', FALSE, 4, 3, 13, NOW(), NOW(), 1),
('Hóa Học 11', 'Sách giáo khoa Hóa Học lớp 11', 32000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_hoa11.jpg', FALSE, 4, 3, 13, NOW(), NOW(), 1);

-- Lớp 12
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Toán 12', 'Sách giáo khoa Toán lớp 12', 34000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_toan12.jpg', FALSE, 4, 3, 14, NOW(), NOW(), 1),
('Ngữ Văn 12', 'Sách giáo khoa Ngữ Văn lớp 12', 37000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_van12.jpg', FALSE, 4, 3, 14, NOW(), NOW(), 1),
('Lịch Sử 12', 'Sách giáo khoa Lịch Sử lớp 12', 32000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ls12.jpg', FALSE, 4, 3, 14, NOW(), NOW(), 1),
('Vật Lý 12', 'Sách giáo khoa Vật Lý lớp 12', 33000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_ly12.jpg', FALSE, 4, 3, 14, NOW(), NOW(), 1),
('Hóa Học 12', 'Sách giáo khoa Hóa Học lớp 12', 33000, 0, 160, 'ENABLE', '2020-06-01', 'sgk_hoa12.jpg', FALSE, 4, 3, 14, NOW(), NOW(), 1);

-- ======================================================
-- BƯỚC 11: INSERT book - SÁCH LẺ (Nguyễn Nhật Ánh)
-- ======================================================
INSERT INTO book (name, description, original_cost, sale, stock, status, published_date, book_image_url, pin, author_id, publisher_id, series_id, created_at, updated_at, created_by) VALUES
('Tôi thấy hoa vàng trên cỏ xanh', 'Câu chuyện tuổi thơ miền Trung', 90000, 15, 120, 'ENABLE', '2010-12-01', 'nna_hoa_vang.jpg', TRUE, 3, 2, NULL, NOW(), NOW(), 1),
('Mắt biếc', 'Chuyện tình đầu dang dở', 85000, 15, 110, 'ENABLE', '1990-01-01', 'nna_mat_biec.jpg', TRUE, 3, 2, NULL, NOW(), NOW(), 1),
('Cho tôi xin một vé đi tuổi thơ', 'Hồi ức tuổi thơ', 75000, 10, 100, 'ENABLE', '2008-01-01', 'nna_ve_tuoi_tho.jpg', FALSE, 3, 2, NULL, NOW(), NOW(), 1);

-- ======================================================
-- BƯỚC 12: INSERT book_category (Gán thể loại cho sách)
-- ======================================================
INSERT INTO book_category (book_id, category_id) VALUES
-- Harry Potter (7 books) - Tiểu thuyết giả tưởng
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1),
-- Doraemon (45 books) - Truyện tranh
(8, 2), (9, 2), (10, 2), (11, 2), (12, 2), (13, 2), (14, 2), (15, 2), (16, 2), (17, 2),
(18, 2), (19, 2), (20, 2), (21, 2), (22, 2), (23, 2), (24, 2), (25, 2), (26, 2), (27, 2),
(28, 2), (29, 2), (30, 2), (31, 2), (32, 2), (33, 2), (34, 2), (35, 2), (36, 2), (37, 2),
(38, 2), (39, 2), (40, 2), (41, 2), (42, 2), (43, 2), (44, 2), (45, 2), (46, 2), (47, 2),
(48, 2), (49, 2), (50, 2), (51, 2), (52, 2),
-- Sách giáo khoa (40 books) - Sách giáo khoa
(53, 4), (54, 4), (55, 4), (56, 4), (57, 4), (58, 4), (59, 4), (60, 4), (61, 4), (62, 4),
(63, 4), (64, 4), (65, 4), (66, 4), (67, 4), (68, 4), (69, 4), (70, 4), (71, 4), (72, 4),
(73, 4), (74, 4), (75, 4), (76, 4), (77, 4), (78, 4), (79, 4), (80, 4), (81, 4), (82, 4),
(83, 4), (84, 4), (85, 4), (86, 4), (87, 4), (88, 4), (89, 4), (90, 4), (91, 4), (92, 4),
(93, 4), (94, 4), (95, 4),
-- Nguyễn Nhật Ánh (3 books) - Văn học thiếu nhi + Văn học Việt Nam
(96, 5), (97, 5), (98, 5);

-- ======================================================
-- BƯỚC 13: INSERT shipping_method
-- ======================================================
INSERT INTO shipping_method (name, description, price) VALUES
('Giao hàng tiết kiệm', 'Giao hàng tiết kiệm 3-5 ngày', 20000),
('Viettel Post', 'Viettel Post 2-3 ngày', 30000),
('Giao hàng nhanh', 'Giao hàng nhanh trong 24h', 50000);

-- ======================================================
-- BƯỚC 14: INSERT payment_method
-- ======================================================
INSERT INTO payment_method (name, provider_code, is_online, description) VALUES
('VNPay', 'VNPAY', TRUE, 'Thanh toán qua VNPay'),
('Momo', 'MOMO', TRUE, 'Thanh toán qua Ví Momo'),
('Thanh toán khi nhận hàng', 'COD', FALSE, 'Thanh toán khi nhận hàng'),
('ZaloPay', 'ZALOPAY', TRUE, 'Thanh toán qua ZaloPay');

-- ======================================================
-- BƯỚC 15: INSERT supplier (Nhà cung cấp)
-- ======================================================
INSERT INTO supplier (name, phone, email, address, status) VALUES
('Công ty Sách Kim Đồng', '0281234567', 'kimdong@supplier.com', '55 Quang Trung, Q.Hà Đông, Hà Nội', 'ACTIVE'),
('Công ty Sách Giáo Dục', '0287654321', 'giaoduc@supplier.com', '81 Trần Hưng Đạo, Q.Hoàn Kiếm, Hà Nội', 'ACTIVE'),
('Công ty Sách Trẻ', '0283456789', 'sachtre@supplier.com', '161B Lý Chính Thắng, Q.3, TP.HCM', 'ACTIVE');


-- ======================================================
-- BƯỚC 19: INSERT cart_item (Giỏ hàng user)
-- ======================================================

INSERT INTO cart (user_id, status, created_at, updated_at) VALUES
(1, 'BUYING', NOW(), NOW()),
(2, 'BUYING', NOW(), NOW());


INSERT INTO cart_item (cart_id, book_id, quantity) VALUES
(2, 1, 2), 
(2, 8, 3),
(2, 93, 1);

-- ======================================================
-- BƯỚC 23: INSERT address
-- ======================================================
INSERT INTO address (user_id, contact_phone, address_detail, is_default) VALUES
(1, '0901234567', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', TRUE),
(2, '0907654321', 'Số 144 Xuân Thủy, Cầu Giấy, Hà Nội', TRUE),
(2, '0912345678', 'Số 25 Nguyễn Trãi, Thanh Xuân, Hà Nội', FALSE);

-- ======================================================
-- BƯỚC 24: INSERT wishlist
-- ======================================================
INSERT INTO wishlist (user_id, book_id) VALUES
(2, 3),
(2, 4),
(2, 95),
(1, 1),
(1, 8);

-- ======================================================
-- BƯỚC 25: INSERT book_comment
-- ======================================================
INSERT INTO book_comment (book_id, user_id, comment, rating, created_at) VALUES
(1, 2, 'Sách rất hay, con tôi rất thích!', 5, '2024-12-12 20:00:00'),
(93, 2, 'Truyện cảm động, đọc mà rơi nước mắt', 5, '2024-12-15 18:30:00'),
(8, 2, 'Doraemon luôn là số 1 trong lòng tôi', 5, '2025-01-05 14:20:00'),
(2, 1, 'Harry Potter phần 2 cũng hấp dẫn không kém phần 1', 4, '2024-11-20 10:00:00');


-- ======================================================
-- KẾT THÚC - DATA INSERTION COMPLETED
-- ======================================================

-- Verify data
SELECT 'AUTHORS' as table_name, COUNT(*) as total_records FROM author
UNION ALL
SELECT 'PUBLISHERS', COUNT(*) FROM publisher
UNION ALL
SELECT 'SERIES', COUNT(*) FROM serie
UNION ALL
SELECT 'CATEGORIES', COUNT(*) FROM category
UNION ALL
SELECT 'USERS', COUNT(*) FROM users
UNION ALL
SELECT 'BOOKS', COUNT(*) FROM book
UNION ALL
SELECT 'BILLS', COUNT(*) FROM bill
UNION ALL
SELECT 'NOTIFICATIONS', COUNT(*) FROM notification;