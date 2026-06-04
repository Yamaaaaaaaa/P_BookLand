# 🎤 Kịch Bản Thuyết Trình Dự Án PTIT BookLand

Kịch bản này được thiết kế để bạn thuyết trình một cách lưu loát, chuyên nghiệp và liền mạch về dự án **PTIT BookLand (Hệ thống quản lý cửa hàng sách trực tuyến)**. Nội dung bao gồm toàn bộ các khía cạnh từ kiến trúc, nghiệp vụ cốt lõi, đến hạ tầng và quy trình triển khai thực tế trên server.

---

## 📌 PHẦN 1: Giới Thiệu Dự Án & Đặt Vấn Đề (Thời lượng: ~1 phút)

**Lời thoại:**
> *"Kính chào thầy cô và các bạn. Em tên là **[Tên của bạn]**, hôm nay em xin đại diện nhóm trình bày về dự án **PTIT BookLand** — Hệ thống quản lý và kinh doanh sách trực tuyến."*
>
> *"Dự án này ban đầu được xây dựng cho môn học **Lập trình Web**, và sau đó tiếp tục được phát triển và tối ưu hóa sâu hơn cho môn **Phát triển hệ thống Thương mại điện tử**. Mục tiêu của BookLand không chỉ dừng lại ở một trang web bán sách thông thường, mà là một hệ thống toàn diện hỗ trợ quản lý kho, xử lý đơn hàng thời gian thực, tìm kiếm thông minh và có khả năng triển khai thực tế trên hạ tầng đám mây với hiệu năng cao."*

---

## 📌 PHẦN 2: Kiến Trúc Hệ Thống & Công Nghệ (Thời lượng: ~2 - 3 phút)

*(Chỉ vào slide sơ đồ kiến trúc hệ thống - `sys_structure.png`)*

**Lời thoại:**
> *"Về mặt kiến trúc, BookLand được thiết kế theo mô hình **Decoupled Architecture** (tách biệt hoàn toàn Frontend và Backend) giúp hệ thống linh hoạt, dễ dàng mở rộng và tối ưu hóa độc lập.*
>
> * **Frontend:** Được xây dựng trên nền tảng **React 18** kết hợp với **TypeScript** và công cụ build **Vite**. Sự kết hợp này mang lại trải nghiệm người dùng mượt mà, hạn chế lỗi lúc runtime nhờ cơ chế type-safe của TypeScript. Để giao tiếp với Backend, nhóm sử dụng thư viện **Axios**, và dùng **STOMP.js** để xử lý kết nối WebSocket thời gian thực.*
> * **Backend:** Sử dụng framework **Spring Boot 3** chạy trên **Java 17**. Nhóm cấu hình **Spring Security** kết hợp với cơ chế phân quyền dựa trên mã token **JWT (JSON Web Token)** tự xây dựng để bảo mật các API.*
> * **Database & Storage:** Dữ liệu quan hệ được lưu trữ trong **MySQL 8.0**. Các tài nguyên đa phương tiện như ảnh sách, banner quảng cáo được tải lên và quản lý tập trung thông qua **Supabase Storage** (dịch vụ lưu trữ đám mây chuẩn S3).*
> * **Caching & Search Engine:** Để giải quyết bài toán tải cao và tìm kiếm tối ưu cho một trang TMĐT, nhóm tích hợp **Redis** làm bộ nhớ đệm (Cache) và **Elasticsearch 8.11.1** làm công cụ tìm kiếm toàn văn (Full-text Search).*
> * **Deployment:** Toàn bộ Backend và Database được triển khai bằng **Docker** trên VPS **Kamatera Cloud**, còn Frontend được host tĩnh trực tiếp trên hạ tầng toàn cầu của **Cloudflare Workers**."*

---

## 📌 PHẦN 3: Các Tính Năng Cốt Lõi & Luồng Nghiệp Vụ Chính (Thời lượng: ~3 - 4 phút)

### 1. Tìm kiếm sách Fuzzy Search (Elasticsearch)
> *"Điểm nhấn đầu tiên của hệ thống là tính năng **Tìm kiếm sách thông minh**. Thay vì truy vấn trực tiếp vào database MySQL bằng lệnh `LIKE` gây chậm hệ thống khi dữ liệu lớn, nhóm đã triển khai **Elasticsearch**.*
>
> * Dữ liệu sách từ MySQL được đồng bộ sang Elasticsearch index tên là `books`.*
> * Khi người dùng tìm kiếm, hệ thống thực hiện truy vấn đa trường (**Multi-match Query**) trên các thuộc tính như tên sách, tác giả, nhà xuất bản, mô tả.*
> * Đặc biệt, nhóm bật cơ chế **Fuzziness (AUTO)** để tự động sửa lỗi chính tả khi người dùng gõ sai, giúp tăng tỷ lệ chuyển đổi mua sắm."*

### 2. Vòng đời đơn hàng & Đồng bộ kho (Order Lifecycle)
*(Chỉ vào slide sequence diagram hoặc state diagram của đơn hàng)*
> *"Hệ thống TMĐT cốt lõi nằm ở quy trình xử lý đơn hàng. Luồng xử lý tại BookLand diễn ra rất chặt chẽ:*
>
> 1. *Khách hàng tạo đơn hàng: Hệ thống kiểm tra số lượng tồn kho ngay lập tức. Nếu đủ, đơn hàng được tạo với trạng thái ban đầu là `PENDING` (Chờ duyệt).*
> 2. *Quản trị viên hoặc Nhân viên duyệt đơn: Đơn hàng chuyển sang `APPROVED` và tiếp tục chuyển qua `SHIPPING` khi giao cho đơn vị vận chuyển.*
> 3. *Kết thúc vòng đời: Đơn hàng đạt trạng thái cuối cùng là `COMPLETED` (Thành công) hoặc `CANCELED` (Bị hủy).*
>
> * **Quy tắc nghiệp vụ quan trọng:**
>   * *Nếu đơn hàng bị chuyển sang trạng thái `CANCELED`, hệ thống sẽ **tự động hoàn lại số lượng tồn kho** cho tất cả các đầu sách trong đơn hàng đó để tránh mất mát dữ liệu.*
>   * *Các trạng thái cuối như `COMPLETED` và `CANCELED` là các trạng thái đóng, không được phép chuyển trạng thái thêm nữa.*
>   * *Chỉ các tài khoản có vai trò `ADMIN`, `MANAGER` hoặc `ORDER_STAFF` mới có quyền thay đổi trạng thái đơn hàng."*

### 3. Thông báo thời gian thực (Real-time Notification via WebSocket)
> *"Để người dùng không phải tải lại trang để biết tình trạng đơn hàng của mình, nhóm đã thiết lập hệ thống **WebSocket (STOMP over SockJS)**. Mỗi khi nhân viên cập nhật trạng thái đơn hàng (ví dụ từ Đang chuẩn bị sang Đang giao), một thông điệp (Notification Event) sẽ ngay lập tức được gửi tới kênh (topic) của khách hàng đó ở client để hiển thị thông báo ngay lập tức."*

### 4. Tích hợp thanh toán trực tuyến VNPay & Bộ nhớ đệm Redis
> *"Về phần thanh toán, hệ thống tích hợp cổng thanh toán **VNPay**. Khi đặt hàng, khách hàng được chuyển hướng sang cổng thanh toán VNPay, sau khi thanh toán xong, VNPay sẽ gọi về callback URL của hệ thống để xác nhận giao dịch.*
>
> *Ngoài ra, để tối ưu hóa hiệu năng hiển thị danh mục sách và thông tin trang chủ, nhóm dùng **Redis** để cache lại các dữ liệu ít thay đổi nhưng tần suất đọc cao. Khi có thay đổi, hệ thống sẽ thực hiện xóa cache hoặc cập nhật lại."*

---

## 📌 PHẦN 4: Hạ Tầng Triển Khai & Thực Hành DevOps (Thời lượng: ~3 phút)

*(Đây là phần rất quan trọng để ghi điểm vì chứng minh được bạn đã đưa ứng dụng chạy thực tế trên Internet)*

**Lời thoại:**
> *"Tiếp theo, em xin trình bày chi tiết về phần triển khai hạ tầng mạng và máy chủ của dự án BookLand.*
>
> ### 1. Thiết lập hạ tầng VPS & Docker hóa toàn bộ
> * *Nhóm sử dụng một máy chủ VPS của hãng **Kamatera Cloud** đặt tại Singapore với cấu hình 4 vCPUs, 8 GB RAM và ổ cứng 40 GB SSD.*
> * *Để đảm bảo tính nhất quán giữa môi trường phát triển (Local) và môi trường chạy thật (Production), nhóm đóng gói toàn bộ dịch vụ qua **Docker Compose**.*
> * *File cấu hình `docker-compose.server.yml` điều phối 4 dịch vụ chính: MySQL 8 (database), Redis 7 (cache), Elasticsearch 8.11.1 (search engine) và Spring Boot Backend.*
> * *Đặc biệt, Backend được đóng gói dưới dạng **Docker Multi-stage Build**:*
>   * *Stage 1 dùng ảnh Gradle để build dự án ra file JAR (loại bỏ các file thừa).*
>   * *Stage 2 chỉ dùng ảnh JRE siêu nhẹ (eclipse-temurin:17-jre-alpine) để chạy file JAR. Điều này giúp giảm kích thước Docker image của Backend xuống mức tối thiểu, tăng tốc độ khởi động và hạn chế các lỗ hổng bảo mật.*
>
> ### 2. Nginx Reverse Proxy & Chứng chỉ SSL HTTPS
> * *Nhóm đăng ký tên miền và cấu hình API Backend chạy dưới domain: `api.p-bookland.io.vn`.*
> * *Trên VPS, nhóm cài đặt **Nginx** đóng vai trò là **Reverse Proxy**. Nginx lắng nghe ở cổng chuẩn `80` (HTTP) và cổng `443` (HTTPS), sau đó chuyển tiếp các yêu cầu (proxy_pass) vào cổng nội bộ `8080` của container Spring Boot Backend.*
> * *Để mã hóa đường truyền dữ liệu, nhóm sử dụng công cụ **Certbot** để đăng ký chứng chỉ SSL miễn phí từ tổ chức **Let's Encrypt** cấp cho domain API.*
>
> ### 3. Tường lửa & Bảo mật hệ thống (Security & Firewall)
> * *Bảo mật cơ sở dữ liệu là ưu tiên hàng đầu. Nhóm thiết lập tường lửa hệ điều hành **UFW** trên VPS và nhóm bảo mật trên giao diện của Kamatera.*
> * *Chỉ mở các cổng công khai cần thiết: cổng `22` (dùng để SSH quản trị), cổng `80/443` (dành cho Nginx phục vụ web).*
> * *Các cổng của Database MySQL (`3307`), Redis (`6379`) và Elasticsearch (`9200`) **hoàn toàn bị chặn khỏi thế giới bên ngoài**. Các container này chỉ giao tiếp nội bộ với nhau trong mạng ảo do Docker thiết lập (Docker Bridge Network) để tránh bị tin tặc dò quét mật khẩu.*
>
> ### 4. Tích hợp Cloudflare & Quy trình cập nhật Code (Git Workflow)
> * *Nhóm đưa domain qua **Cloudflare Proxy** để chống tấn công DDoS và tăng tốc độ DNS. Để tránh lỗi vòng lặp chuyển hướng thường gặp (`ERR_TOO_MANY_REDIRECTS`), nhóm đã cấu hình chế độ SSL/TLS trên Cloudflare ở dạng **Full**.*
> * *Quy trình cập nhật tính năng mới (CI/CD cơ bản): Khi dev hoàn thiện code ở máy cá nhân, họ đẩy lên nhánh `dev_backend` trên GitHub. Trên VPS, nhóm thực hiện SSH vào, chạy lệnh `git pull` để lấy mã nguồn mới nhất, và chạy lệnh `docker compose -f docker-compose.server.yml up -d --build bookland-be` để build lại riêng container backend mà **không làm gián đoạn hay mất dữ liệu** trong database hoặc Redis.*
>
> *Dữ liệu database được ghi đè lâu dài lên thư mục host VPS thông qua Docker Volumes (`mysql_data`), đảm bảo an toàn ngay cả khi container bị khởi động lại.*"

---

## 📌 PHẦN 5: Tổng Kết & Demo Thực Tế (Thời lượng: ~1-2 phút)

**Lời thoại:**
> *"Tóm lại, dự án PTIT BookLand đã giải quyết tốt bài toán của một hệ thống thương mại điện tử hiện đại: từ giao diện React mượt mà, cơ chế tìm kiếm thông minh Elasticsearch, xử lý đơn hàng thời gian thực qua WebSocket, đến việc tối ưu hóa hạ tầng DevOps bằng Docker và Nginx SSL thực tế trên cloud VPS.*
>
> *Sau đây, em xin phép demo trực tiếp các luồng chức năng quan trọng: từ đặt hàng, thanh toán qua VNPay, nhân viên duyệt đơn và nhận thông báo tức thời ngay trên màn hình.*
>
> *Em xin chân thành cảm ơn thầy cô đã lắng nghe. Nhóm em rất mong nhận được những ý kiến đóng góp từ thầy cô để hoàn thiện hệ thống hơn nữa!"*

---

## 💡 BỘ CÂU HỎI PHẢN BIỆN (Q&A) THƯỜNG GẶP & CÁCH TRẢ LỜI GHI ĐIỂM

Dưới đây là các câu hỏi mà hội đồng giám khảo/thầy cô rất hay hỏi đối với cấu hình hệ thống này:

### ❓ Câu hỏi 1: Tại sao em lại dùng Elasticsearch thay vì truy vấn `LIKE` trực tiếp trong MySQL? Dữ liệu giữa MySQL và Elasticsearch được đồng bộ như thế nào?
* **Cách trả lời:**
  * *"Dạ thưa thầy/cô, truy vấn `LIKE '%keyword%'` trong MySQL bắt buộc hệ thống phải quét toàn bộ bảng (Table Scan) và không thể sử dụng index hiệu quả, dẫn đến nghẽn database khi số lượng sách lên tới hàng chục nghìn cuốn hoặc khi có nhiều người dùng tìm kiếm cùng lúc."*
  * *"Elasticsearch sử dụng cấu trúc dữ liệu **Inverted Index** (chỉ mục đảo ngược) chuyên biệt cho tìm kiếm văn bản, phản hồi cực kỳ nhanh (mili-giây). Nó hỗ trợ phân tích ngôn ngữ (Tokenization) và cơ chế tìm kiếm mờ (Fuzzy Search) tự động sửa lỗi chính tả, điều mà MySQL không làm được hoặc làm rất chậm."*
  * *"Về cơ chế đồng bộ: Trong code Spring Boot Backend, mỗi khi có hành động thêm/sửa/xóa sách thông qua API, hệ thống sẽ thực hiện lưu vào MySQL trước, sau đó gọi service `BookSearchService` để đồng bộ thực thể đó sang Elasticsearch index (lưu hoặc xóa document tương ứng). Nhóm cũng viết thêm một hàm `syncAllBooks()` chạy ngầm để đồng bộ lại toàn bộ dữ liệu từ DB sang ES khi cần thiết."*

### ❓ Câu hỏi 2: Em dùng Redis trong dự án này để làm gì? Khi dữ liệu trong Database thay đổi thì Cache Redis có bị sai lệch không và giải quyết thế nào?
* **Cách trả lời:**
  * *"Dạ, nhóm dùng Redis làm bộ nhớ đệm (Cache) cho các dữ liệu có tần suất đọc rất cao nhưng ít thay đổi, ví dụ như: Danh mục sách (Categories), danh sách banner, hoặc top các cuốn sách bán chạy ở trang chủ. Việc này giúp giảm tải cho MySQL và phản hồi người dùng ngay lập tức."*
  * *"Để tránh sai lệch dữ liệu (Stale Cache) khi admin chỉnh sửa hoặc thêm sách mới, nhóm áp dụng chiến lược **Cache Eviction** (Xóa cache): Mỗi khi có API thay đổi dữ liệu sách/danh mục, hệ thống sẽ tự động gọi lệnh xóa key cache tương ứng trong Redis (hoặc dùng lệnh `redis-cli FLUSHALL` khi deploy phiên bản mới). Ở lần yêu cầu tiếp theo từ người dùng, do cache trống (Cache Miss), hệ thống sẽ truy vấn từ MySQL, cập nhật lại vào Redis rồi mới trả về cho client."*

### ❓ Câu hỏi 3: Tại sao em lại tách cổng MySQL trên Server thành `3307` thay vì cổng mặc định `3306`? Có an toàn không khi để lộ cổng này?
* **Cách trả lời:**
  * *"Dạ, trên Docker container, MySQL vẫn chạy cổng `3306`. Tuy nhiên, nhóm ánh xạ ra ngoài host port là `3307` để tránh xung đột nếu trên hệ điều hành VPS đã cài sẵn một dịch vụ MySQL khác chạy cổng `3306`."*
  * *"Về mặt an toàn: Cổng `3307` này **không hề bị lộ ra ngoài Internet**. Nhóm đã cấu hình tường lửa **UFW** chỉ cho phép cổng `22` và `80/443` kết nối công cộng. Do đó, người ngoài không thể kết nối tới cổng `3307` từ xa. Chỉ có các container nội bộ kết nối với nhau hoặc khi chúng ta SSH vào VPS thì mới thao tác được."*

### ❓ Câu hỏi 4: Nginx Reverse Proxy có tác dụng gì trong hệ thống của em?
* **Cách trả lời:**
  * *"Dạ, Nginx đóng vai trò là chốt chặn đầu tiên đón nhận các request từ Internet gửi đến. Nó có 3 tác dụng lớn trong hệ thống của em:*
    1. * **Bảo mật và che giấu port nội bộ:** Người dùng truy cập qua cổng tiêu chuẩn `80` hoặc `443` với tên miền `api.p-bookland.io.vn`. Nginx sẽ chuyển hướng ngầm vào port `8080` của Spring Boot. Port `8080` được đóng kín, không cần mở ra ngoài internet."*
    2. * **Quản lý chứng chỉ SSL (HTTPS):** Nginx trực tiếp đảm nhận việc cấu hình HTTPS và bắt tay SSL với trình duyệt client. Điều này giúp Spring Boot Backend giảm tải công việc giải mã SSL, chỉ cần tập trung xử lý logic nghiệp vụ dưới dạng HTTP thông thường.*
    3. * **Khả năng Load Balancing (Cân bằng tải) tương lai:** Nếu sau này lượng truy cập tăng cao, nhóm chỉ cần chạy thêm nhiều bản sao của Backend container và cấu hình Nginx phân phối tải cho các container đó một cách dễ dàng.*"

### ❓ Câu hỏi 5: Tại sao em lại cấu hình SSL trên Cloudflare là "Full" hoặc "Full (strict)"? Nếu chọn "Flexible" thì bị lỗi gì?
* **Cách trả lời:**
  * *"Dạ, nếu chọn chế độ **Flexible**, Cloudflare sẽ giao tiếp với khách hàng bằng HTTPS (cổng 443) nhưng lại giao tiếp với VPS của em bằng HTTP (cổng 80). Vì trên Nginx của VPS nhóm đã cấu hình tự động chuyển hướng mọi yêu cầu HTTP (cổng 80) sang HTTPS (cổng 443), việc này sẽ dẫn đến một vòng lặp chuyển hướng vô tận (Redirect Loop) khiến người dùng gặp lỗi `ERR_TOO_MANY_REDIRECTS`.*"
  * *"Bằng cách chuyển sang chế độ **Full** hoặc **Full (strict)**, Cloudflare sẽ kết nối tới Nginx bằng HTTPS (cổng 443), đồng nhất giao thức mã hóa từ đầu tới cuối (End-to-End Encryption) và sửa triệt để lỗi này, giúp hệ thống bảo mật tối đa."*
