# 🚀 Hướng Dẫn Triển Khai Hệ Thống BookLand Lên Server (Backend + DB + Redis + Elasticsearch)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai toàn bộ hệ thống BookLand (Backend, Database, Redis, Elasticsearch) lên máy chủ VPS **Kamatera Cloud** mới qua SSH bằng **Docker** và **Git**.

---

## 📌 Thông Tin Hệ Thống Server
* **Tên Server:** `kaitaserver`
* **Địa chỉ IP Server (Public WAN):** `103.6.168.46`
* **Tài khoản SSH:** `root`
* **Cấu hình phần cứng:** 4 vCPUs | 8 GB RAM | 40 GB SSD (Chạy ở vùng Singapore)
* **Các dịch vụ được triển khai:**
  * **Backend (Spring Boot):** Port `8080` (Mặc định được ánh xạ qua Nginx proxy hoặc truy cập trực tiếp)
  * **Database (MySQL 8.0):** Port `3307` (Ánh xạ nội bộ từ 3306 của container)
  * **Cache (Redis 7):** Port `6379` (Chạy nội bộ trong Docker Network)
  * **Search Engine (Elasticsearch 8.11.1):** Port `9200` (Chạy nội bộ trong Docker Network)

---

## 🛠️ Bước 1: Kết Nối Vào Server & Cập Nhật Hệ Thống

1. Mở Terminal (PowerShell, Bash hoặc Git Bash) ở máy cá nhân của bạn và chạy lệnh sau để đăng nhập vào VPS qua SSH:
   ```bash
   ssh root@103.6.168.46
   ```
   *(Nhập mật khẩu VPS của bạn khi được yêu cầu).*

2. Cập nhật danh sách gói phần mềm và nâng cấp hệ thống lên phiên bản mới nhất:
   ```bash
   apt update && apt upgrade -y
   ```

3. Cài đặt các công cụ cơ bản cần thiết (Git, curl, nano, ufw):
   ```bash
   apt install git curl nano ufw -y
   ```

---

## 🐳 Bước 2: Cài Đặt Docker & Docker Compose Lên Server

Nếu máy chủ mới của bạn chưa cài đặt Docker, hãy chạy các lệnh sau để cài đặt phiên bản Docker Engine chính thức:

1. Tải và chạy script cài đặt Docker tự động:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. Cài đặt Docker Compose v2 (dạng plugin):
   ```bash
   sudo apt install docker-compose-plugin -y
   ```

3. Kiểm tra xem Docker & Docker Compose đã hoạt động chưa:
   ```bash
   docker --version
   docker compose version
   ```

---

## 📂 Bước 3: Clone Dự Án & Thiết Lập File Môi Trường (`.env`)

1. Chọn một thư mục để chứa mã nguồn trên server (ví dụ `/root/app`):
   ```bash
   mkdir -p /root/app
   cd /root/app
   ```

2. Clone Git repository dự án của bạn và chuyển thẳng sang nhánh `dev_backend`:
   ```bash
   git clone -b dev_backend https://github.com/Yamaaaaaaaa/P_BookLand.git ptit-bookland
   cd ptit-bookland
   ```

3. **Cấu hình File Môi trường Production (`.env.production`):**
   Do Frontend được triển khai riêng trên Cloudflare tại địa chỉ `https://p-bookland.sonasked1.workers.dev` nên VPS này **chỉ chạy Backend, Database và Redis** (thông qua file `docker-compose.server.yml` đã được tách phần Frontend). 

   Bạn cần đảm bảo file `.env.production` cấu hình đúng các địa chỉ CORS và redirect của Frontend:
   * **CORS_ALLOWED_ORIGINS:** `https://p-bookland.sonasked1.workers.dev`
   * **VNP_RETURN_URL:** `https://p-bookland.sonasked1.workers.dev/shop/payment-result`

   **Cách 1: Truyền bằng lệnh SCP (Chạy ở terminal máy cá nhân của bạn):**
   Mở một terminal mới **trên máy cá nhân (Local)** tại thư mục gốc của dự án `PTIT_BookLand` và chạy:
   ```bash
   scp BookLand_BE/.env.production root@103.6.168.46:/root/app/ptit-bookland/BookLand_BE/
   ```
   *(Nhập mật khẩu VPS để hoàn tất truyền tệp).*

   **Cách 2: Tạo thủ công trực tiếp trên server:**
   Nếu không dùng SCP, bạn có thể tạo và soạn thảo file trực tiếp trên Server:
   ```bash
   nano BookLand_BE/.env.production
   ```
   Sau đó sao chép nội dung cấu hình sản xuất của bạn và dán vào, sau đó nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát.

---

## 🚢 Bước 4: Triển Khai Hệ Thống Bằng Docker Compose

Chúng tôi sử dụng file cấu hình dành riêng cho server `docker-compose.server.yml` tại thư mục gốc dự án:

1. Khởi chạy các container ở chế độ chạy ngầm (detached mode) và build lại Backend:
   ```bash
   docker compose -f docker-compose.server.yml up -d --build
   ```
   *Lệnh này sẽ tải MySQL, Redis, đồng thời build dự án Spring Boot thành file Jar trong Docker container.*

2. Kiểm tra trạng thái hoạt động của các container:
   ```bash
   docker compose -f docker-compose.server.yml ps
   ```
   *(Đảm bảo cả 3 container `bookland-db`, `bookland-redis`, và `bookland-be` đều báo trạng thái Up/running).*

3. **Theo dõi logs khởi động của Backend** để kiểm tra quá trình chạy ứng dụng:
   ```bash
   docker compose -f docker-compose.server.yml logs -f bookland-be
   ```
   *(Nhấn `Ctrl + C` để ngừng theo dõi logs).*

---

## 🔄 Bước 5: Quy Trình Cập Nhật Code Mới (Git Workflow)

Khi bạn tiếp tục code ở máy cá nhân (Local) và muốn cập nhật phiên bản mới lên Server:

1. **Ở máy cá nhân (Local):**
   Đẩy các thay đổi lên GitHub từ nhánh `dev_backend`:
   ```bash
   git add .
   git commit -m "feat: cập nhật chức năng mới"
   git push origin dev_backend
   ```

2. **Ở máy chủ (Server):**
   SSH vào server và thực hiện các lệnh sau để kéo code mới về và build lại:
   ```bash
   # Di chuyển vào thư mục dự án trên VPS
   cd /root/app/ptit-bookland
   
   # Kéo code mới nhất từ nhánh dev_backend
   git pull origin dev_backend
   
   # Chỉ cần build lại dịch vụ backend (không ảnh hưởng tới Database và Redis)
   docker compose -f docker-compose.server.yml up -d --build bookland-be
   
   # (Tùy chọn) Dọn dẹp các images cũ để giải phóng dung lượng đĩa:
   docker image prune -f
   ```

---

## 🔒 Bước 6: Các Biện Pháp Bảo Mật Quan Trọng & Firewall

> [!IMPORTANT]
> **1. Mở Cổng Trên Tường Lửa Kamatera (BẮT BUỘC):**
> Giao diện quản trị của Kamatera có một tab chuyên biệt tên là **FIREWALL** (bên cạnh CONNECT và SNAPSHOTS). Bạn bắt buộc phải truy cập vào đó và cấu hình mở các cổng:
> - `22/tcp` (SSH)
> - `80/tcp` và `443/tcp` (HTTP/HTTPS cho web/API)
> - `8080/tcp` (Nếu bạn muốn frontend truy cập thẳng vào API Spring Boot mà không qua Nginx)
>
> **2. Thiết lập Tường lửa trên HĐH (UFW) trên VPS:**
> Cấu hình UFW để chỉ cho phép các cổng cần thiết kết nối từ bên ngoài:
> ```bash
> # Cho phép kết nối SSH (BẮT BUỘC để tránh bị khóa ngoài server)
> ufw allow 22/tcp
> 
> # Cho phép cổng HTTP/HTTPS phục vụ API
> ufw allow 80/tcp
> ufw allow 443/tcp
> 
> # Cho phép cổng 8080 tạm thời (nếu chưa cài SSL Nginx)
> ufw allow 8080/tcp
> 
> # Kích hoạt tường lửa
> ufw enable
> ```
> *Lưu ý: Không mở cổng `3307` (MySQL) và `6379` (Redis) ra ngoài Internet để tránh bị dò quét và hack dữ liệu.*
>
> **3. Bảo toàn dữ liệu Database:**
> Dữ liệu MySQL được lưu trữ lâu dài ở volume có tên `mysql_data` trên host VPS. Restart container hay rebuild code **sẽ không làm mất dữ liệu**. Tuy nhiên, nếu bạn chạy lệnh `docker compose -f docker-compose.server.yml down -v` (có cờ `-v`), nó sẽ xóa sạch volume dữ liệu này. Hãy cẩn thận!

---

## 🌐 Mở Rộng: Cấu Hình Tên Miền (Domain) & HTTPS (SSL) bằng Nginx Reverse Proxy

Để API của backend chạy qua đường dẫn HTTPS an toàn (ví dụ `https://api.p-bookland.io.vn`) kết nối với Cloudflare Proxy:

### ⚠️ Lưu ý quan trọng về DNS Cloudflare (Tránh lỗi 521 "Web server is down")
Nếu bạn đang gặp lỗi **521 "Web server is down"** khi truy cập `https://api.p-bookland.io.vn`, đó là do Cloudflare chưa kết nối được tới VPS mới của bạn. Hãy thực hiện 2 việc sau:
1. **Cập nhật A Record trên Cloudflare:** Đăng nhập vào trang quản trị DNS Cloudflare, tìm bản ghi `A` có tên `api` (hoặc `api.p-bookland.io.vn`) và đổi giá trị IP cũ thành IP mới của bạn: **`103.6.168.46`**.
2. **Cài đặt Nginx & chạy container:** Lỗi 521 cũng xuất hiện nếu bạn chưa chạy Nginx trên VPS hoặc chưa mở cổng `80/443` trên tường lửa Kamatera. Hãy làm theo các bước dưới đây để cài đặt:

1. Cài đặt Nginx và Certbot Let's Encrypt trên server:
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   ```

2. Tạo file cấu hình Nginx cho API:
   ```bash
   nano /etc/nginx/sites-available/bookland-be
   ```

3. Dán đoạn cấu hình sau vào (thay `api.p-bookland.io.vn` bằng domain thực tế của bạn):
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
           
           # Hỗ trợ WebSockets (Cho thông báo real-time)
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   *(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

4. Kích hoạt cấu hình và chạy thử Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/bookland-be /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

5. Cài đặt chứng chỉ SSL tự động từ Let's Encrypt:
   ```bash
   certbot --nginx -d api.p-bookland.io.vn
   ```
   *(Nhập email cá nhân/công việc bất kỳ của bạn — ví dụ: `sonasked1@gmail.com` — để Let's Encrypt gửi thông báo nhắc nhở khi chứng chỉ sắp hết hạn hoặc gặp sự cố, sau đó bấm `Y` để đồng ý với điều khoản dịch vụ).*

6. Đóng cổng 8080 để chỉ cho phép truy cập qua cổng HTTPS (443):
   ```bash
   ufw delete allow 8080/tcp
   ufw reload
   ```

> [!WARNING]
> ### ⚠️ Cách sửa lỗi `ERR_TOO_MANY_REDIRECTS` khi dùng Cloudflare
> Nếu bạn sử dụng Cloudflare để quản lý DNS tên miền và bật Proxy (đám mây màu vàng), bạn có thể gặp lỗi vòng lặp chuyển hướng do xung đột SSL.
>
> **Cách xử lý:**
> 1. Truy cập Dashboard **Cloudflare**.
> 2. Chọn tên miền của bạn và chuyển đến phần **SSL/TLS**.
> 3. Đổi chế độ mã hóa SSL từ **Flexible** (Linh hoạt) thành **Full** hoặc **Full (strict)**. Trang web sẽ hoạt động bình thường ngay lập tức.
