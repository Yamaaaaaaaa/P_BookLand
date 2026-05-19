# 🚀 Hướng Dẫn Triển Khai Hệ Thống BookLand Lên Server (Backend + DB + Redis)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai toàn bộ hệ thống BookLand (ngoại trừ Frontend) lên máy chủ VPS qua SSH bằng **Docker** và **Git**.

---

## 📌 Thông Tin Hệ Thống Server
* **Địa chỉ IP Server:** `114.29.239.206`
* **Tài khoản SSH:** `root`
* **Các dịch vụ được triển khai:**
  * **Backend (Spring Boot):** Port `8080`
  * **Database (MySQL 8.0):** Port `3307` (nội bộ hoặc công khai)
  * **Cache (Redis 7):** Port `6379` (nội bộ)

---

## 🛠️ Bước 1: Kết Nối Vào Server & Cập Nhật Hệ Thống

1. Mở Terminal (PowerShell, Bash hoặc Git Bash) ở máy cá nhân của bạn và chạy lệnh sau để đăng nhập vào VPS:
   ```bash
   ssh root@114.29.239.206
   ```
   *(Nhập mật khẩu VPS của bạn khi được yêu cầu).*

2. Cập nhật danh sách gói phần mềm và nâng cấp hệ thống lên phiên bản mới nhất:
   ```bash
   apt update && apt upgrade -y
   ```

3. Cài đặt các công cụ cơ bản cần thiết (Git, curl, ufw):
   ```bash
   apt install git curl ufw -y
   ```

---

## 🐳 Bước 2: Cài Đặt Docker & Docker Compose Lên Server

Nếu máy chủ của bạn chưa cài đặt Docker, hãy chạy các lệnh sau để cài đặt phiên bản Docker Engine chính thức:

1. Tải và chạy script cài đặt Docker tự động:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. Kiểm tra xem Docker đã hoạt động chưa:
   ```bash
   docker --version
   systemctl status docker
   ```
   *(Nhấn `q` để thoát trạng thái hiển thị).*

---

## 📂 Bước 3: Clone Dự Án & Thiết Lập File Môi Trường (`.env`)

1. Chọn một thư mục để chứa mã nguồn trên server (ví dụ `/var/www` hoặc `/root/app`):
   ```bash
   mkdir -p /root/app
   cd /root/app
   ```

2. Clone Git repository dự án của bạn và chuyển thẳng sang nhánh `dev_backend`:
   ```bash
   # Thay đổi URL dưới đây bằng URL repository thực tế của bạn
   git clone -b dev_backend https://github.com/Yamaaaaaaaa/P_BookLand.git ptit-bookland
   cd ptit-bookland
   ```

3. **Copy File Môi Trường Production (`.env.production`) Lên Server:**
   Để đảm bảo bảo mật và tránh lộ mật mã/khóa bí mật, file `.env.production` nên được lưu trữ và quản lý cục bộ ở máy cá nhân chứ không đẩy lên GitHub công khai.
   
   Hãy mở một **Terminal mới trên máy cá nhân (Local)** tại thư mục gốc của dự án `PTIT_BookLand` và chạy lệnh `scp` dưới đây để truyền file sang server:
   ```bash
   scp BookLand_BE/.env.production root@114.29.239.206:/root/app/ptit-bookland/BookLand_BE/
   ```
   *(Nhập mật khẩu VPS để hoàn tất truyền tệp).*
   
   Nếu sau này bạn muốn chỉnh sửa nhanh bất cứ thông số cấu hình nào trực tiếp trên server, bạn có thể chạy lệnh:
   ```bash
   nano BookLand_BE/.env.production
   ```

---

## 🚢 Bước 4: Triển Khai Hệ Thống Bằng Docker Compose

Chúng tôi đã chuẩn bị sẵn file `docker-compose.server.yml` chỉ chứa Backend, MySQL và Redis (đã loại bỏ Frontend):

1. Khởi chạy các container ở chế độ chạy ngầm (detached mode) và build lại Backend:
   ```bash
   docker compose -f docker-compose.server.yml up -d --build
   ```

2. Kiểm tra danh sách các container đang hoạt động trên server:
   ```bash
   docker compose -f docker-compose.server.yml ps
   ```

3. **Theo dõi logs khởi động của Backend** để đảm bảo quá trình tự động tạo bảng (schema) và nạp dữ liệu mẫu (`data.sql`) diễn ra thành công:
   ```bash
   docker compose -f docker-compose.server.yml logs -f bookland-be
   ```
   *(Nhấn `Ctrl + C` để ngừng theo dõi log).*

---

## 🔄 Bước 5: Quy Trình Cập Nhật Code Mới (Git Workflow)

Khi bạn tiếp tục code ở máy cá nhân (Local) và muốn cập nhật phiên bản mới lên Server:

1. **Ở máy cá nhân (Local):**
   Đẩy các thay đổi lên GitHub/GitLab từ nhánh `dev_backend`:
   ```bash
   git add .
   git commit -m "feat: cập nhật chức năng mới"
   git push origin dev_backend
   ```

2. **Ở máy chủ (Server):**
   SSH vào server và thực hiện các lệnh sau để kéo code nhánh `dev_backend` về:
   ```bash
   cd /root/app/ptit-bookland
   git pull origin dev_backend
   
   # Chỉ cần build lại dịch vụ backend (không ảnh hưởng tới Database và Redis)
   docker compose -f docker-compose.server.yml up -d --build bookland-be
   ```

---

## 🔒 Bước 6: Các Biện Phương Bảo Mật Quan Trọng (Security Best Practices)

> **Cảnh báo bảo mật:**
> Máy chủ có IP công khai rất dễ bị dò quét mật khẩu và tấn công. Hãy thực hiện ngay các bước sau:

### 1. Đổi mật khẩu mặc định của Admin
Sau khi hệ thống khởi chạy lần đầu, hãy đăng nhập ngay vào tài khoản quản trị mặc định (`admin` / `admin`) và tiến hành thay đổi mật khẩu sang một chuỗi bảo mật hơn.

### 2. Thiết lập Tường lửa (UFW)
Chỉ cho phép truy cập SSH và cổng API của Backend từ bên ngoài. Tuyệt đối không mở công khai các cổng Database (`3307`) và Redis (`6379`) ra internet trừ khi thực sự cần thiết.

```bash
# Cho phép kết nối SSH (BẮT BUỘC để tránh tự khóa mình bên ngoài)
ufw allow 22/tcp

# Cho phép truy cập Backend API
ufw allow 8080/tcp

# Kích hoạt tường lửa
ufw enable
```

---

## 🌐 Mở Rộng: Cấu Hình Tên Miền (Domain) & HTTPS (SSL) bằng Nginx Reverse Proxy

Để API của bạn chạy chuyên nghiệp dưới dạng địa chỉ `https://api.p-bookland.io.vn` thay vì sử dụng IP và cổng `http://114.29.239.206:8080`, hãy làm theo hướng dẫn sau:

> [!NOTE]
> **Nginx & Certbot là gì? Chúng dùng để làm gì?**
> * **Nginx (Web Server / Reverse Proxy):** Là một máy chủ web hiệu năng cao đóng vai trò như một **"Lễ tân bảo mật"** ở cửa ngõ VPS. Nginx lắng nghe các kết nối từ Internet gửi tới cổng `80` (HTTP) và `443` (HTTPS). Khi nhận được yêu cầu, Nginx sẽ tiếp nhận, xử lý mã hóa bảo mật và âm thầm chuyển tiếp (proxy) yêu cầu đó vào cổng nội bộ `8080` cho ứng dụng Spring Boot chạy bên trong. Điều này giúp bảo vệ mã nguồn, ẩn cổng chạy thực tế của Spring Boot và tăng tối đa hiệu năng.
> * **Certbot (Let's Encrypt):** Là công cụ tự động đăng ký, cài đặt cấu hình và tự động gia hạn chứng chỉ bảo mật **SSL/TLS miễn phí** từ tổ chức Let's Encrypt. Certbot giúp biến API của bạn từ dạng không an toàn (`http://`) thành dạng bảo mật mã hóa đầu cuối (`https://`).

1. Cài đặt Nginx và Certbot Let's Encrypt trên server:
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   ```

2. Tạo file cấu hình Nginx:
   ```bash
   nano /etc/nginx/sites-available/bookland-be
   ```

3. Dán đoạn cấu hình sau vào:
   ```nginx
   server {
       listen 80;
       server_name api.p-bookland.io.vn;

       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Hỗ trợ WebSockets (Cho real-time chat)
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   ```javascript
      // Bước 1 (Lưu file): Ấn tổ hợp phím Ctrl + O (chữ O, không phải số 0).
      // Bước 2 (Xác nhận tên file): Hệ thống sẽ hiện dòng hỏi xác nhận tên file ở cuối màn hình, bạn chỉ cần nhấn phím Enter.
      // Bước 3 (Thoát ra): Ấn tổ hợp phím Ctrl + X để quay lại dòng lệnh chính của Linux.
   ```

4. Kích hoạt cấu hình và restart Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/bookland-be /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

> [!IMPORTANT]
> **Mở cổng Firewall trước khi cấp chứng chỉ SSL:**
> Let's Encrypt bắt buộc phải kết nối tới máy chủ của bạn qua cổng `80` (HTTP) để xác thực quyền sở hữu tên miền. Do đó, bạn **bắt buộc** phải mở cổng 80 và 443 trên tường lửa trước khi chạy lệnh Certbot:
> ```bash
> ufw allow 80/tcp
> ufw allow 443/tcp
> ufw reload
> ```

5. Cài đặt chứng chỉ SSL miễn phí tự động gia hạn:
   ```bash
   certbot --nginx -d api.p-bookland.io.vn
   ```
   *(Lúc này Certbot sẽ tự động xác thực và cấu hình HTTPS SSL toàn diện cho bạn).*
   
6. Tăng cường bảo mật tối đa (Đóng cổng backend 8080 từ internet):
   Sau khi hoàn tất cài đặt SSL, để đảm bảo không ai có thể truy cập trực tiếp cổng Backend `8080` chưa được mã hóa mà bắt buộc phải đi qua Reverse Proxy HTTPS bảo mật, hãy thực hiện đóng cổng 8080 trực tiếp từ bên ngoài:
   ```bash
   ufw delete allow 8080/tcp
   ufw reload
   ```

> [!WARNING]
> ### ⚠️ Xử lý lỗi vòng lặp chuyển hướng `ERR_TOO_MANY_REDIRECTS` (Nếu dùng Cloudflare)
> Nếu bạn tích hợp tên miền qua Cloudflare và gặp lỗi **`ERR_TOO_MANY_REDIRECTS`** khi truy cập `https://api.p-bookland.io.vn`, đây là hiện tượng xung đột chế độ mã hóa giữa Cloudflare và Nginx SSL.
> 
> **Cách xử lý cực kỳ đơn giản:**
> 1. Truy cập vào trang quản trị **Cloudflare**.
> 2. Chọn tên miền của bạn và click vào mục **SSL/TLS** ở thanh menu bên trái.
> 3. Chuyển chế độ mã hóa từ **Flexible** (Linh hoạt) thành **Full** hoặc **Full (strict)** *(Khuyên dùng chế độ **Full (strict)** để mã hóa hoàn toàn từ trình duyệt đến VPS và đạt bảo mật cao nhất)*.
> 4. Reload (F5) lại trình duyệt, trang API sẽ hoạt động mượt mà ngay lập tức!

---
*Chúc bạn triển khai thành công dự án BookLand! Nếu có bất kỳ vấn đề gì phát sinh trong quá trình cấu hình trên server, hãy hỏi tôi ngay lập tức.*
