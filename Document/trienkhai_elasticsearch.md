# Tài Liệu Tích Hợp Elasticsearch — PTIT BookLand

> **Phiên bản:** Elasticsearch 8.11.1 | Spring Boot 3.5.x | Spring Data Elasticsearch 5.5.7  
> **Ngày:** 2026-05-19  
> **Môi trường:** Local Docker  

---

## 1. Tổng Quan Kiến Trúc

Hệ thống BookLand tích hợp Elasticsearch để cung cấp tính năng **tìm kiếm sách toàn văn (Full-Text Search)** nhanh chóng và thông minh, thay thế cho các truy vấn `LIKE '%keyword%'` chậm chạp trên MySQL.

### Luồng hoạt động tổng thể

```
Client
  │
  ▼
BookSearchController  ──►  BookSearchService
                                  │
                      ┌───────────┼───────────────────┐
                      ▼           ▼                   ▼
          ElasticsearchOperations  BookElasticRepo   BookRepository
                      │                               │
                      ▼                               ▼
              Elasticsearch (Docker)            MySQL (Docker)
                 Index: "books"              Table: book
```

### Nguyên tắc đồng bộ dữ liệu

| Sự kiện | Hành động với Elasticsearch |
|---------|----------------------------|
| Tạo sách mới (`POST /api/books`) | Index document mới vào ES ngay lập tức |
| Cập nhật sách (`PUT /api/books/{id}`) | Cập nhật document trong ES ngay lập tức |
| Cập nhật số lượng kho (`PATCH /api/books/{id}/stock`) | Cập nhật document trong ES ngay lập tức |
| Xóa sách (`DELETE /api/books/{id}`) | Xóa document khỏi ES ngay lập tức |
| Đồng bộ toàn bộ (`POST /api/books/search/sync`) | Xóa toàn bộ index → Lấy lại từ MySQL → Index lại |

---

## 2. Cấu Hình Hạ Tầng

### 2.1 Docker Compose

File `docker-compose.yml` — Service Elasticsearch được cấu hình đơn giản nhất cho môi trường local:

```yaml
bookland-elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.1
  container_name: bookland-elasticsearch
  restart: always
  environment:
    - discovery.type=single-node      # Chế độ 1 node độc lập (không cluster)
    - xpack.security.enabled=false    # Tắt bảo mật (local only, không cần SSL/TLS)
    - ES_JAVA_OPTS=-Xms512m -Xmx512m  # Giới hạn RAM JVM tối đa 512MB
  ports:
    - "9200:9200"
  volumes:
    - es_data:/usr/share/elasticsearch/data  # Persistent volume, dữ liệu không mất khi restart
```

> **Lý do tắt `xpack.security`:** Để tránh phức tạp về SSL/TLS certificate và username/password  
> trên môi trường phát triển local. **Không áp dụng cho Production!**

### 2.2 Kết nối từ Backend

Biến môi trường được truyền vào container `bookland-be`:

```yaml
environment:
  - ELASTICSEARCH_URIS=http://bookland-elasticsearch:9200
```

Trong file `.env` (khi chạy Spring Boot trực tiếp trên máy, không qua Docker):

```properties
ELASTICSEARCH_URIS=http://localhost:9200
```

Trong `application.properties`:

```properties
# ================= ELASTICSEARCH =================
spring.elasticsearch.uris=${ELASTICSEARCH_URIS:http://localhost:9200}
```

### 2.3 Dependency Gradle

```groovy
/* ================= ELASTICSEARCH ================= */
implementation 'org.springframework.boot:spring-boot-starter-data-elasticsearch'
```

> **Lưu ý:** Spring Boot 3.5.x sẽ tự động chọn phiên bản Spring Data Elasticsearch và  
> Elasticsearch Java Client tương thích. Không cần khai báo version thủ công.

---

## 3. Cấu Trúc Mã Nguồn

Toàn bộ code Elasticsearch được tổ chức trong package riêng biệt:

```
com.example.bookland_be/
└── elasticsearch/
    ├── document/
    │   └── BookDocument.java          # Ánh xạ Document ↔ Index
    ├── repository/
    │   └── BookElasticsearchRepository.java  # Thao tác CRUD với ES
    └── service/
        └── BookSearchService.java     # Logic tìm kiếm & đồng bộ
```

---

## 4. Chi Tiết Từng Lớp

### 4.1 BookDocument — Ánh xạ Document

**File:** `elasticsearch/document/BookDocument.java`

```java
@Document(indexName = "books")  // Tên index trong Elasticsearch
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookDocument {

    @Id
    private String id;                  // Khóa chính (lưu dưới dạng String "_id" trong ES)

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;                // Tên sách — được phân tách từ ngữ (tokenized)

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;         // Mô tả — được phân tách từ ngữ

    @Field(type = FieldType.Double)
    private Double originalCost;        // Giá gốc — dùng được để sort/range query

    @Field(type = FieldType.Double)
    private Double sale;                // Phần trăm giảm giá

    @Field(type = FieldType.Double)
    private Double finalPrice;          // Giá sau giảm — dùng được để sort/range query

    @Field(type = FieldType.Integer)
    private Integer stock;              // Số lượng tồn kho

    @Field(type = FieldType.Keyword)
    private String status;              // Trạng thái: ENABLE / DISABLE — dùng được để filter chính xác

    @Field(type = FieldType.Text, analyzer = "standard")
    private String bookImageUrl;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String authorName;          // Tên tác giả — tìm kiếm được bằng full-text

    @Field(type = FieldType.Text, analyzer = "standard")
    private String publisherName;       // Tên nhà xuất bản — tìm kiếm được

    @Field(type = FieldType.Keyword)
    private Set<String> categories;     // Tên các thể loại — dùng được để filter chính xác
}
```

**Sự khác biệt giữa `FieldType.Text` và `FieldType.Keyword`:**

| Loại | Mô tả | Dùng cho |
|------|-------|---------|
| `Text` | Phân tách và phân tích từ ngữ khi index, hỗ trợ tìm kiếm toàn văn | `name`, `description`, `authorName`, `publisherName` |
| `Keyword` | Lưu nguyên vẹn, so khớp chính xác, dùng được cho sort/aggregation | `status`, `categories` |
| `Double`, `Integer` | Số học, dùng được cho sort và range filter | `finalPrice`, `originalCost`, `stock` |

---

### 4.2 BookElasticsearchRepository — Thao Tác CRUD

**File:** `elasticsearch/repository/BookElasticsearchRepository.java`

```java
@Repository
public interface BookElasticsearchRepository extends ElasticsearchRepository<BookDocument, String> {
    // Kế thừa sẵn: save(), saveAll(), deleteById(), deleteAll(), findAll(Pageable)
    // Không cần định nghĩa gì thêm — toàn bộ tìm kiếm phức tạp được xử lý bởi BookSearchService
}
```

> **Lý do không định nghĩa derived query:** Các phương thức sinh tự động từ tên (`findByNameContaining...`)  
> trong Spring Data Elasticsearch bị dịch thành **wildcard query** — loại query không được phép  
> chạy trên trường kiểu `text` vì gây `search_phase_execution_exception` trong Elasticsearch.  
> Thay vào đó, toàn bộ tìm kiếm sử dụng `ElasticsearchOperations` trực tiếp.

---

### 4.3 BookSearchService — Logic Tìm Kiếm & Đồng Bộ

**File:** `elasticsearch/service/BookSearchService.java`

#### Các phương thức chính:

**`indexBook(Book book)`** — Đồng bộ 1 cuốn sách lên ES:
```java
@Transactional(readOnly = true)
public void indexBook(Book book) {
    bookElasticsearchRepository.save(convertToDocument(book));
}
```

**`deleteBook(Long id)`** — Xóa 1 cuốn sách khỏi ES:
```java
public void deleteBook(Long id) {
    bookElasticsearchRepository.deleteById(id.toString());
}
```

**`syncAllBooks()`** — Đồng bộ toàn bộ từ MySQL sang ES (xóa toàn bộ rồi index lại):
```java
@Transactional(readOnly = true)
public void syncAllBooks() {
    bookElasticsearchRepository.deleteAll();
    List<Book> books = bookRepository.findAll();
    List<BookDocument> docs = books.stream()
            .map(this::convertToDocument)
            .collect(Collectors.toList());
    bookElasticsearchRepository.saveAll(docs);
}
```

**`searchBooks(String keyword, Pageable pageable)`** — Tìm kiếm toàn văn:
```java
public Page<BookDocument> searchBooks(String keyword, Pageable pageable) {
    co.elastic.clients.elasticsearch._types.query_dsl.Query esQuery;

    if (keyword == null || keyword.trim().isEmpty()) {
        // Trả toàn bộ sách nếu không có keyword
        esQuery = QueryBuilders.matchAll().build()._toQuery();
    } else {
        // Tìm kiếm toàn văn với sửa lỗi chính tả tự động
        esQuery = QueryBuilders.multiMatch()
                .query(keyword)
                .fields("name", "description", "authorName", "publisherName")
                .fuzziness("AUTO")
                .build()
                ._toQuery();
    }

    Query query = NativeQuery.builder()
            .withQuery(esQuery)
            .withPageable(pageable)
            .build();

    SearchHits<BookDocument> hits = elasticsearchOperations.search(query, BookDocument.class);
    List<BookDocument> results = hits.getSearchHits()
            .stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());

    return new PageImpl<>(results, pageable, hits.getTotalHits());
}
```

**Giải thích `multi_match` với `fuzziness: AUTO`:**

```
keyword = "Hary Poter"  (gõ sai chính tả)
                │
                ▼
  Elasticsearch: fuzziness="AUTO"
  → Chấp nhận sai lệch 1-2 ký tự tùy độ dài từ
  → "Hary" ≈ "Harry" (sai 1 ký tự) ✓
  → "Poter" ≈ "Potter" (sai 1 ký tự) ✓
                │
                ▼
  Kết quả: "Harry Potter và Hòn đá Phù thủy" xuất hiện trong kết quả
```

**`convertToDocument(Book book)`** — Chuyển đổi Entity MySQL → ES Document:
```java
private BookDocument convertToDocument(Book book) {
    Set<String> categoryNames = book.getCategories() != null
            ? book.getCategories().stream().map(Category::getName).collect(Collectors.toSet())
            : Set.of();

    return BookDocument.builder()
            .id(book.getId().toString())
            .name(book.getName())
            .description(book.getDescription())
            .originalCost(book.getOriginalCost())
            .sale(book.getSale())
            .finalPrice(book.getFinalPrice())
            .stock(book.getStock())
            .status(book.getStatus() != null ? book.getStatus().name() : null)
            .bookImageUrl(book.getBookImageUrl())
            .authorName(book.getAuthor() != null ? book.getAuthor().getName() : null)
            .publisherName(book.getPublisher() != null ? book.getPublisher().getName() : null)
            .categories(categoryNames)
            .build();
}
```

---

### 4.4 BookSearchController — REST API

**File:** `controller/common/BookSearchController.java`  
**Base URL:** `GET /api/books/search`

#### API 1: Tìm kiếm sách

```
GET /api/books/search
```

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|---------|-------|
| `keyword` | String | `null` | Từ khóa tìm kiếm (tên, mô tả, tác giả, NXB). Để trống → trả tất cả sách |
| `page` | int | `0` | Trang cần lấy (bắt đầu từ 0) |
| `size` | int | `10` | Số bản ghi mỗi trang |
| `sortBy` | String | `null` | Trường sắp xếp: `finalPrice`, `originalCost`, `stock`, `sale`. Để trống hoặc `id` → sắp xếp theo độ liên quan |
| `sortDirection` | String | `DESC` | Hướng sắp xếp: `ASC` hoặc `DESC` |

**Lưu ý quan trọng về sorting:**
- Khi `sortBy = null` hoặc `sortBy = "id"` → **Không truyền sort vào ES**, kết quả được sắp xếp theo **relevance score (`_score`)** — tức là cuốn sách khớp keyword nhất sẽ xếp đầu tiên. Đây là hành vi mặc định đúng nhất cho một Search API.
- Khi `sortBy = "finalPrice"` → Sắp xếp theo giá sau giảm.
- **Không thể sort theo `id`** vì trong Elasticsearch, `id` được lưu dưới dạng metadata `_id` (kiểu text), không sort được như một trường số thông thường.

**Ví dụ Request:**
```bash
# Tìm kiếm và sắp xếp theo giá tăng dần
GET /api/books/search?keyword=Harry Potter&page=0&size=5&sortBy=finalPrice&sortDirection=ASC

# Lấy tất cả sách, trang 2
GET /api/books/search?page=1&size=20

# Tìm theo tác giả (có thể gõ sai chính tả nhẹ)
GET /api/books/search?keyword=Nguyen Nhat Anh
```

**Response mẫu:**
```json
{
  "code": 1000,
  "result": {
    "content": [
      {
        "id": "1",
        "name": "Harry Potter và Hòn đá Phù thủy",
        "description": "Tập 1: Harry Potter khám phá thế giới phù thuật",
        "originalCost": 120000,
        "sale": 10.0,
        "finalPrice": 108000,
        "stock": 50,
        "status": "ENABLE",
        "bookImageUrl": "https://...",
        "authorName": "J.K. Rowling",
        "publisherName": "NXB Trẻ",
        "categories": ["Tiểu thuyết giả tưởng"]
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

#### API 2: Đồng bộ toàn bộ dữ liệu (Admin only)

```
POST /api/books/search/sync
Authorization: Bearer <token>  (yêu cầu ROLE_ADMIN hoặc ROLE_MANAGER)
```

Khi nào cần gọi API này:
- **Lần đầu tiên** sau khi hệ thống khởi động (ES index trống, MySQL đã có dữ liệu).
- Sau khi **xóa và tạo lại volume** `es_data` của Docker.
- Khi phát hiện dữ liệu ES và MySQL **bị lệch nhau** do sự cố.

**Response:**
```json
{
  "code": 1000,
  "result": "Successfully synchronized all books to Elasticsearch!"
}
```

---

## 5. Tích Hợp Với BookService (Real-time Sync)

File `service/BookService.java` đã được nhúng `BookSearchService` để tự động đồng bộ:

```java
// Khai báo dependency
private final BookSearchService bookSearchService;

// Sau khi tạo sách mới
Book savedBook = bookRepository.save(book);
bookSearchService.indexBook(savedBook);   // ← Đồng bộ lên ES ngay

// Sau khi cập nhật sách
Book updatedBook = bookRepository.save(book);
bookSearchService.indexBook(updatedBook); // ← Cập nhật ES ngay

// Sau khi cập nhật số lượng kho
Book updatedBook = bookRepository.save(book);
bookSearchService.indexBook(updatedBook); // ← Cập nhật ES ngay

// Sau khi xóa sách
bookRepository.delete(book);
bookSearchService.deleteBook(id);         // ← Xóa khỏi ES ngay
```

---

## 6. Kibana — Giao Diện Quản Lý Trực Quan

Kibana được thêm vào `docker-compose.yml` để quản lý và kiểm tra dữ liệu ES:

```yaml
bookland-kibana:
  image: docker.elastic.co/kibana/kibana:8.11.1
  container_name: bookland-kibana
  restart: always
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://bookland-elasticsearch:9200
  depends_on:
    - bookland-elasticsearch
```

**Truy cập:** `http://localhost:5601`

### 6.1 Các câu lệnh Dev Tools hữu ích

Mở **Kibana → Dev Tools** và chạy các lệnh sau:

```json
// Kiểm tra số lượng sách đã sync
GET _cat/indices?v

// Xem tất cả sách
GET books/_search
{
  "query": { "match_all": {} }
}

// Tìm kiếm theo từ khóa
GET books/_search
{
  "query": {
    "multi_match": {
      "query": "Harry Potter",
      "fields": ["name", "description", "authorName", "publisherName"],
      "fuzziness": "AUTO"
    }
  }
}

// Xem cấu trúc mapping (schema) của index
GET books/_mapping

// Xem thông tin cluster
GET _cluster/health
```

---

## 7. Các Vấn Đề Đã Gặp & Cách Giải Quyết

### Vấn đề 1: `400 Bad Request` khi sort theo `id`

**Nguyên nhân:** Trong Elasticsearch, ID của document được lưu dưới tên metadata `_id` (kiểu text không sortable), không phải cột `id` thông thường. Frontend gửi `sortBy=id` dẫn đến lỗi.

**Giải pháp:** Trong `BookSearchController`, khi `sortBy = "id"` → không truyền sort vào `Pageable`, để ES tự sắp xếp theo relevance score.

---

### Vấn đề 2: `search_phase_execution_exception` với `Containing` query

**Nguyên nhân:** Spring Data Elasticsearch tự động dịch tên phương thức `findByNameContaining...` thành **wildcard query (`*keyword*`)**. Elasticsearch từ chối thực thi wildcard query trên trường kiểu `text` vì hiệu năng cực kỳ kém, gây lỗi ở tất cả các shard.

**Giải pháp:** Bỏ hoàn toàn derived query method, sử dụng `ElasticsearchOperations` với `NativeQuery` và `multi_match` query.

---

### Vấn đề 3: `search_phase_execution_exception` với `@Query` annotation

**Nguyên nhân:** Annotation `@Query` của Spring Data Elasticsearch kết hợp với `Sort` trong `Pageable` gây ra xung đột nội bộ trong việc dịch truy vấn sang ES native query.

**Giải pháp (cuối cùng):** Sử dụng `ElasticsearchOperations` + `NativeQuery` + `QueryBuilders` trực tiếp — đây là cách tiếp cận **toàn quyền kiểm soát**, tránh mọi xung đột của Spring Data abstraction layer.

```java
// Cách đúng — dùng Native API
Query query = NativeQuery.builder()
        .withQuery(esQuery)
        .withPageable(pageable)
        .build();
SearchHits<BookDocument> hits = elasticsearchOperations.search(query, BookDocument.class);
```

---

## 8. Hướng Dẫn Vận Hành

### Khởi động lần đầu

```bash
# Bước 1: Khởi động tất cả services
docker compose up -d

# Bước 2: Đợi ~30s để ES và Backend khởi động hoàn toàn
# Kiểm tra: http://localhost:9200 → phải trả về JSON thông tin ES

# Bước 3: Đồng bộ dữ liệu lần đầu (yêu cầu token Admin)
POST http://localhost:8080/api/books/search/sync
Authorization: Bearer <admin_token>
```

### Rebuild sau khi thay đổi code

```bash
# Build lại image backend
docker compose build bookland-be

# Restart container mới
docker compose up -d
```

### Kiểm tra nhanh trên trình duyệt

| URL | Mục đích |
|-----|---------|
| `http://localhost:9200` | Kiểm tra Elasticsearch đang chạy |
| `http://localhost:9200/books/_count` | Đếm số document trong index |
| `http://localhost:9200/books/_mapping` | Xem schema mapping của index |
| `http://localhost:5601` | Giao diện Kibana |
