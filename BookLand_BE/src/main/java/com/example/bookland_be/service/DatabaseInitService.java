package com.example.bookland_be.service;

import java.time.LocalDate;
import java.util.HashSet;

import com.example.bookland_be.entity.Author;
import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.Category;
import com.example.bookland_be.entity.PaymentMethod;
import com.example.bookland_be.entity.Publisher;
import com.example.bookland_be.entity.Serie;
import com.example.bookland_be.entity.ShippingMethod;
import com.example.bookland_be.entity.Supplier;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.repository.AuthorRepository;
import com.example.bookland_be.repository.BookRepository;
import com.example.bookland_be.repository.CategoryRepository;
import com.example.bookland_be.repository.PaymentMethodRepository;
import com.example.bookland_be.repository.PublisherRepository;
import com.example.bookland_be.repository.SerieRepository;
import com.example.bookland_be.repository.ShippingMethodRepository;
import com.example.bookland_be.repository.SupplierRepository;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.repository.WishlistRepository;
import com.example.bookland_be.repository.PurchaseInvoiceRepository;
import com.example.bookland_be.repository.PurchaseInvoiceBookRepository;
import com.example.bookland_be.repository.PaymentTransactionRepository;
import com.example.bookland_be.repository.EventTargetRepository;
import com.example.bookland_be.repository.EventRuleRepository;
import com.example.bookland_be.repository.EventRepository;
import com.example.bookland_be.repository.EventImageRepository;
import com.example.bookland_be.repository.EventLogRepository;
import com.example.bookland_be.repository.EventActionRepository;
import com.example.bookland_be.repository.CartItemRepository;
import com.example.bookland_be.repository.BookCommentRepository;
import com.example.bookland_be.repository.BillBookRepository;
import com.example.bookland_be.repository.BillRepository;
import com.example.bookland_be.elasticsearch.service.BookSearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitService {

    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;
    private final SerieRepository serieRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final ShippingMethodRepository shippingMethodRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final SupplierRepository supplierRepository;

    private final WishlistRepository wishlistRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final PurchaseInvoiceBookRepository purchaseInvoiceBookRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final EventTargetRepository eventTargetRepository;
    private final EventRuleRepository eventRuleRepository;
    private final EventRepository eventRepository;
    private final EventImageRepository eventImageRepository;
    private final EventLogRepository eventLogRepository;
    private final EventActionRepository eventActionRepository;
    private final CartItemRepository cartItemRepository;
    private final BookCommentRepository bookCommentRepository;
    private final BillBookRepository billBookRepository;
    private final BillRepository billRepository;
    private final BookSearchService bookSearchService;

    @Transactional
    public String seedData() {
        log.info("Starting manual database seeding.....");

        if (bookRepository.count() > 0) {
            log.info("Books are already present in the database. Seeding skipped.");
            return "Dữ liệu sách đã tồn tại trong cơ sở dữ liệu. Bỏ qua seeding để tránh trùng lặp.";
        }

        // Fetch creator (admin user)
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Tài khoản admin chưa được khởi tạo! Hãy khởi chạy ứng dụng để tự động tạo admin trước."));

        log.info("Manual Seeding: Seeding Authors...");
        // 3. Tạo các author
        Author author1 = authorRepository.save(Author.builder()
                .name("J.K. Rowling")
                .description("Tác giả người Anh, nổi tiếng với series Harry Potter")
                .authorImage("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/1280px-J._K._Rowling_2010.jpg")
                .build());
        Author author2 = authorRepository.save(Author.builder()
                .name("Fujiko F. Fujio")
                .description("Bút danh của Hiroshi Fujimoto, tác giả truyện Doraemon")
                .authorImage("https://upload.wikimedia.org/wikipedia/vi/d/de/Doraemon_with_signature.gif")
                .build());
        Author author3 = authorRepository.save(Author.builder()
                .name("Nguyễn Nhật Ánh")
                .description("Nhà văn Việt Nam nổi tiếng với các tác phẩm thiếu nhi")
                .authorImage("https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Nguyen_Nhat_Anh_in_January_2019.png/960px-Nguyen_Nhat_Anh_in_January_2019.png")
                .build());
        Author author4 = authorRepository.save(Author.builder()
                .name("Bộ Giáo dục và Đào tạo")
                .description("Tác giả các sách giáo khoa Việt Nam")
                .authorImage("https://xdcs.cdnchinhphu.vn/thumb_w/640/446259493575335936/2023/5/24/bgd-16849118818681667510301.jpg")
                .build());
        log.info("Authors have been seeded.");

        log.info("Manual Seeding: Seeding Publishers...");
        // 4. Tạo các publisher
        Publisher publisher1 = publisherRepository.save(Publisher.builder()
                .name("NXB Kim Đồng")
                .description("Nhà xuất bản chuyên sách thiếu nhi Việt Nam")
                .build());
        Publisher publisher2 = publisherRepository.save(Publisher.builder()
                .name("NXB Trẻ")
                .description("Nhà xuất bản văn học và thiếu nhi")
                .build());
        Publisher publisher3 = publisherRepository.save(Publisher.builder()
                .name("NXB Giáo dục Việt Nam")
                .description("Nhà xuất bản sách giáo khoa")
                .build());
        Publisher publisher4 = publisherRepository.save(Publisher.builder()
                .name("Bloomsbury Publishing")
                .description("Nhà xuất bản Harry Potter bản tiếng Anh")
                .build());
        log.info("Publishers have been seeded.");

        log.info("Manual Seeding: Seeding Series...");
        // 5. Tạo các serie
        Serie serie1 = serieRepository.save(Serie.builder()
                .name("Harry Potter")
                .description("Bộ tiểu thuyết giả tưởng 7 tập về phù thủy Harry Potter")
                .build());
        Serie serie2 = serieRepository.save(Serie.builder()
                .name("Doraemon")
                .description("Bộ truyện tranh dài về chú mèo máy đến từ tương lai")
                .build());
        
        // Mảng chứa 12 bộ sách giáo khoa từ Lớp 1 đến Lớp 12
        Serie[] gradeSeries = new Serie[12];
        for (int i = 1; i <= 12; i++) {
            gradeSeries[i - 1] = serieRepository.save(Serie.builder()
                    .name("Sách Giáo Khoa Lớp " + i)
                    .description("Bộ sách giáo khoa lớp " + i)
                    .build());
        }
        log.info("Series have been seeded.");

        log.info("Manual Seeding: Seeding Categories...");
        // 6. Tạo các category
        Category category1 = categoryRepository.save(Category.builder()
                .name("Tiểu thuyết giả tưởng")
                .imageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/tieu_thuyet_gia_tuong.png")
                .description("Sách thuộc thể loại giả tưởng, phép thuật")
                .pin(true)
                .build());
        Category category2 = categoryRepository.save(Category.builder()
                .name("Truyện tranh")
                .imageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/truyen-tranh.png")
                .description("Manga, Comic")
                .pin(true)
                .build());
        Category category3 = categoryRepository.save(Category.builder()
                .name("Văn học thiếu nhi")
                .imageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/van_hoc_thieu_nhi.png")
                .description("Sách dành cho thiếu nhi")
                .pin(true)
                .build());
        Category category4 = categoryRepository.save(Category.builder()
                .name("Sách giáo khoa")
                .imageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/sach_giao_khoa.png")
                .description("Sách giáo khoa phổ thông")
                .pin(true)
                .build());
        Category category5 = categoryRepository.save(Category.builder()
                .name("Văn học Việt Nam")
                .imageUrl(null)
                .description("Tác phẩm văn học của tác giả Việt Nam")
                .pin(true)
                .build());
        log.info("Categories have been seeded.");

        log.info("Manual Seeding: Seeding Books (Harry Potter)...");
        // 7. Tạo các sách - Harry Potter (7 tập)
        var harryPotterCategories = new HashSet<Category>();
        harryPotterCategories.add(category1);

        bookRepository.save(Book.builder()
                .name("Harry Potter và Hòn đá Phù thủy")
                .description("Tập 1: Harry Potter khám phá thế giới phù thuật")
                .originalCost(120000.0)
                .sale(10.0)
                .stock(50)
                .publishedDate(LocalDate.of(1997, 6, 26))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/4591ca46-374f-4896-b824-6d4a6c05b8ff-nxbtre_full_21042022_030444.jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Phòng chứa Bí mật")
                .description("Tập 2: Bí mật trong trường Hogwarts")
                .originalCost(130000.0)
                .sale(10.0)
                .stock(45)
                .publishedDate(LocalDate.of(1998, 7, 2))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/95c45d12-4825-4008-8460-d2f344a12d73-nxbtre_full_21472017_034753.jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Tên tù nhân ngục Azkaban")
                .description("Tập 3: Sirius Black trốn thoát")
                .originalCost(135000.0)
                .sale(10.0)
                .stock(40)
                .publishedDate(LocalDate.of(1999, 7, 8))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/0ac2c531-8d88-49e5-abad-5c275efe33b6-nxbtre_full_24342024_033441.jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Chiếc cốc lửa")
                .description("Tập 4: Giải đấu Tam Pháp thuật")
                .originalCost(150000.0)
                .sale(10.0)
                .stock(35)
                .publishedDate(LocalDate.of(2000, 7, 8))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/fb84ad97-6106-4f06-9e74-4de8fe75edb8-nxbtre_full_20342017_033410.jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Hội Phượng Hoàng")
                .description("Tập 5: Sự trở lại của Voldemort")
                .originalCost(160000.0)
                .sale(10.0)
                .stock(30)
                .publishedDate(LocalDate.of(2003, 6, 21))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/a333cea6-e2ed-4966-ba16-89cac8497952-nxbtre_full_28042023_110430.jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Hoàng tử lai")
                .description("Tập 6: Bí mật về Voldemort")
                .originalCost(155000.0)
                .sale(10.0)
                .stock(25)
                .publishedDate(LocalDate.of(2005, 7, 16))
                .bookImageUrl("https://upload.wikimedia.org/wikipedia/vi/a/a5/HBP.JPG")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Harry Potter và Bảo bối Tử thần")
                .description("Tập 7: Trận chiến cuối cùng")
                .originalCost(170000.0)
                .sale(10.0)
                .stock(20)
                .publishedDate(LocalDate.of(2007, 7, 21))
                .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/7390ee2e-3bee-4d19-9c51-f2fea42d5cf8-images%20(2).jpg")
                .pin(true)
                .author(author1)
                .publisher(publisher2)
                .series(serie1)
                .creator(admin)
                .categories(harryPotterCategories)
                .build());

        log.info("Harry Potter books have been seeded.");

        log.info("Manual Seeding: Seeding Books (Doraemon)...");
        // 8. Tạo các sách - Doraemon (45 tập)
        var doraemonCategories = new HashSet<Category>();
        doraemonCategories.add(category2);

        for (DoraemonBookData data : DORAEMON_BOOKS) {
            bookRepository.save(Book.builder()
                    .name(data.name)
                    .description(data.desc)
                    .originalCost(25000.0)
                    .sale(5.0)
                    .stock(data.stock)
                    .publishedDate(LocalDate.parse(data.date))
                    .bookImageUrl(data.image)
                    .pin(false)
                    .author(author2)
                    .publisher(publisher1)
                    .series(serie2)
                    .creator(admin)
                    .categories(doraemonCategories)
                    .build());
        }
        log.info("Doraemon books have been seeded.");

        log.info("Manual Seeding: Seeding Books (Textbooks)...");
        // 9. Tạo các sách - Sách Giáo Khoa Lớp 1-12
        var textbookCategories = new HashSet<Category>();
        textbookCategories.add(category4);

        for (TextbookData data : TEXTBOOK_BOOKS) {
            bookRepository.save(Book.builder()
                    .name(data.name)
                    .description(data.desc)
                    .originalCost(data.cost)
                    .sale(0.0)
                    .stock(data.stock)
                    .publishedDate(LocalDate.of(2020, 6, 1))
                    .bookImageUrl(data.image)
                    .pin(false)
                    .author(author4)
                    .publisher(publisher3)
                    .series(gradeSeries[data.grade - 1])
                    .creator(admin)
                    .categories(textbookCategories)
                    .build());
        }
        log.info("Textbook books have been seeded.");

        log.info("Manual Seeding: Seeding Books (Nguyễn Nhật Ánh)...");
        // 10. Tạo các sách lẻ - Nguyễn Nhật Ánh
        var nnaCategories = new HashSet<Category>();
        nnaCategories.add(category5);

        bookRepository.save(Book.builder()
                .name("Tôi thấy hoa vàng trên cỏ xanh")
                .description("Câu chuyện tuổi thơ miền Trung")
                .originalCost(90000.0)
                .sale(15.0)
                .stock(120)
                .publishedDate(LocalDate.of(2010, 12, 1))
                .bookImageUrl("https://static.oreka.vn/800-800_f2abbc10-2a20-45ea-9a45-71564996ab51.webp")
                .pin(true)
                .author(author3)
                .publisher(publisher2)
                .series(null)
                .creator(admin)
                .categories(nnaCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Mắt biếc")
                .description("Chuyện tình đầu dang dở")
                .originalCost(85000.0)
                .sale(15.0)
                .stock(110)
                .publishedDate(LocalDate.of(1990, 1, 1))
                .bookImageUrl("https://static.oreka.vn/800-800_933f4713-38dc-42cf-98ed-dca3b48c3343")
                .pin(true)
                .author(author3)
                .publisher(publisher2)
                .series(null)
                .creator(admin)
                .categories(nnaCategories)
                .build());

        bookRepository.save(Book.builder()
                .name("Cho tôi xin một vé đi tuổi thơ")
                .description("Hồi ức tuổi thơ")
                .originalCost(75000.0)
                .sale(10.0)
                .stock(100)
                .publishedDate(LocalDate.of(2008, 1, 1))
                .bookImageUrl("https://static.oreka.vn/800-800_163bc337-669e-482b-95c5-9f1a17b717a7")
                .pin(false)
                .author(author3)
                .publisher(publisher2)
                .series(null)
                .creator(admin)
                .categories(nnaCategories)
                .build());

        log.info("Nguyễn Nhật Ánh books have been seeded.");

        log.info("Manual Seeding: Seeding Shipping Methods...");
        // 11. Tạo shipping_method
        shippingMethodRepository.save(ShippingMethod.builder()
                .name("Giao hàng tiết kiệm")
                .description("Giao hàng tiết kiệm 3-5 ngày")
                .price(20000.0)
                .build());
        shippingMethodRepository.save(ShippingMethod.builder()
                .name("Viettel Post")
                .description("Viettel Post 2-3 ngày")
                .price(30000.0)
                .build());
        shippingMethodRepository.save(ShippingMethod.builder()
                .name("Giao hàng nhanh")
                .description("Giao hàng nhanh trong 24h")
                .price(50000.0)
                .build());
        log.info("Shipping methods have been seeded.");

        log.info("Manual Seeding: Seeding Payment Methods...");
        // 12. Tạo payment_method
        paymentMethodRepository.save(PaymentMethod.builder()
                .name("VNPay")
                .providerCode("VNPAY")
                .isOnline(true)
                .description("Thanh toán qua VNPay")
                .build());
        paymentMethodRepository.save(PaymentMethod.builder()
                .name("Momo")
                .providerCode("MOMO")
                .isOnline(true)
                .description("Thanh toán qua Ví Momo")
                .build());
        paymentMethodRepository.save(PaymentMethod.builder()
                .name("Thanh toán khi nhận hàng")
                .providerCode("COD")
                .isOnline(false)
                .description("Thanh toán khi nhận hàng")
                .build());
        paymentMethodRepository.save(PaymentMethod.builder()
                .name("ZaloPay")
                .providerCode("ZALOPAY")
                .isOnline(true)
                .description("Thanh toán qua ZaloPay")
                .build());
        log.info("Payment methods have been seeded.");

        log.info("Manual Seeding: Seeding Suppliers...");
        // 13. Tạo supplier
        supplierRepository.save(Supplier.builder()
                .name("Công ty Sách Kim Đồng")
                .phone("0281234567")
                .email("kimdong@supplier.com")
                .address("55 Quang Trung, Q.Hà Đông, Hà Nội")
                .status(Supplier.SupplierStatus.ACTIVE)
                .build());
        supplierRepository.save(Supplier.builder()
                .name("Công ty Sách Giáo Dục")
                .phone("0287654321")
                .email("giaoduc@supplier.com")
                .address("81 Trần Hưng Đạo, Q.Hoàn Kiếm, Hà Nội")
                .status(Supplier.SupplierStatus.ACTIVE)
                .build());
        supplierRepository.save(Supplier.builder()
                .name("Công ty Sách Trẻ")
                .phone("0283456789")
                .email("sachtre@supplier.com")
                .address("161B Lý Chính Thắng, Q.3, TP.HCM")
                .status(Supplier.SupplierStatus.ACTIVE)
                .build());
        log.info("Suppliers have been seeded.");

        log.info("Database seeding completed successfully! Synchronizing to Elasticsearch...");
        try {
            bookSearchService.syncAllBooks();
            log.info("Elasticsearch synchronization successful.");
        } catch (Exception e) {
            log.error("Failed to sync books to Elasticsearch: ", e);
            return "Khởi tạo dữ liệu mẫu MySQL thành công, nhưng đồng bộ Elasticsearch thất bại: " + e.getMessage();
        }
        return "Khởi tạo dữ liệu cơ sở dữ liệu mẫu và đồng bộ Elasticsearch thành công!";
    }

    @Transactional
    public String clearData() {
        log.info("Starting manual database clearing.....");

        log.info("Deleting Wishlist, CartItems, Comments...");
        bookCommentRepository.deleteAll();
        cartItemRepository.deleteAll();
        wishlistRepository.deleteAll();

        log.info("Deleting Bills and Transactions...");
        billBookRepository.deleteAll();
        paymentTransactionRepository.deleteAll();
        billRepository.deleteAll();

        log.info("Deleting Purchase Invoices...");
        purchaseInvoiceBookRepository.deleteAll();
        purchaseInvoiceRepository.deleteAll();

        log.info("Deleting Events...");
        eventTargetRepository.deleteAll();
        eventRuleRepository.deleteAll();
        eventLogRepository.deleteAll();
        eventActionRepository.deleteAll();
        eventImageRepository.deleteAll();
        eventRepository.deleteAll();

        log.info("Deleting seeded Books, Categories, Series, Publishers, Authors, Suppliers, Shipping/Payment Methods...");
        bookRepository.deleteAll();
        categoryRepository.deleteAll();
        serieRepository.deleteAll();
        publisherRepository.deleteAll();
        authorRepository.deleteAll();
        shippingMethodRepository.deleteAll();
        paymentMethodRepository.deleteAll();
        supplierRepository.deleteAll();

        log.info("Database clearing completed successfully! Synchronizing to Elasticsearch...");
        try {
            bookSearchService.syncAllBooks();
            log.info("Elasticsearch clearing successful.");
        } catch (Exception e) {
            log.error("Failed to clear Elasticsearch book documents: ", e);
            return "Xóa dữ liệu MySQL thành công, nhưng xóa dữ liệu Elasticsearch thất bại: " + e.getMessage();
        }
        return "Xóa toàn bộ dữ liệu mẫu (bao gồm Elasticsearch, ngoại trừ User, Role, Permission) thành công!";
    }

    private static class DoraemonBookData {
        String name;
        String desc;
        int stock;
        String date;
        String image;

        DoraemonBookData(String name, String desc, int stock, String date, String image) {
            this.name = name;
            this.desc = desc;
            this.stock = stock;
            this.date = date;
            this.image = image;
        }
    }

    private static final DoraemonBookData[] DORAEMON_BOOKS = {
        new DoraemonBookData("Doraemon - Truyện dài - Tập 1: Khủng long của Nobita", "Nobita tìm thấy trứng khủng long", 100, "1980-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(8).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 2: Lịch sử khai phá vũ trụ", "Cuộc phiêu lưu ngoài vũ trụ", 95, "1981-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/31b0f59e6131b88cf5f7d52870cc42a3.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 3: Lâu đài dưới đáy biển", "Khám phá đại dương", 90, "1983-01-01", "https://cdn1.fahasa.com/media/catalog/product/t/i/tieu-thuyet-doraemon_nobita-va-lau-dai-duoi-day-bien-phien-ban-moi_bia.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 4: Xứ sở ma thuật", "Thế giới phép thuật kỳ diệu", 88, "1984-01-01", "https://bizweb.dktcdn.net/thumb/large/100/576/749/products/bia-doraemon-dai-tt-truyen-dai4-bm-1f39991aed1c4beb8b66431f1c4f7971.jpg?v=1760800879263"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 5: Chuyến phiêu lưu ở miền Tây hoang dã", "Cuộc phiêu lưu miền Viễn Tây", 85, "1982-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(17).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 6: Cuộc đại thủy chiến ở xứ sở người cá", "Thế giới dưới nước", 82, "1983-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon_-_nobita_va_cuoc_chien_dai_thuy_o_xu_so_nguoi_ca_-_tb_2020_dd53b454cee444e6a6a4b03c35e4c3f7_1024x1024.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 7: Binh đoàn người sắt", "Robot xâm lược Trái Đất", 80, "1986-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(4).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 8: Những hiệp sĩ không gian", "Chiến đấu trong vũ trụ", 78, "1985-01-01", "https://cdn1.fahasa.com/media/catalog/product/d/o/doraemon-movie-story-mau_nobita-va-nhung-hiep-si-khong-gian_bia.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 9: Vua quỷ ở thành phố ngầm", "Thế giới ngầm bí ẩn", 76, "1983-08-01", "https://upload.wikimedia.org/wikipedia/vi/f/f1/Th%C3%A0nh_ph%E1%BB%91_th%C3%BA_nh%E1%BB%93i_b%C3%B4ng.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 11: Cuộc phiêu lưu vào rừng xanh", "Phiêu lưu trong rừng nhiệt đới", 72, "1992-01-01", "https://i.ebayimg.com/images/g/RWUAAOSwLYRgHrWe/s-l1600.webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 12: Vương quốc trên mây", "Thế giới trên mây", 70, "1992-03-01", "https://cdn1.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---nobita-va-vuong-quoc-tren-may---tb-2023--tap-12.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 13: Mê cung thiếc", "Cuộc phiêu lưu trong mê cung", 68, "1993-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/21f9c55bb574784671984443bb3d2bc5.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 14: Những vị thần bí ẩn", "Hành tinh thần bí", 66, "1997-01-01", "https://upload.wikimedia.org/wikipedia/vi/c/ce/Cu%E1%BB%99c_phi%C3%AAu_l%C6%B0u_%C4%91%E1%BA%BFn_v%C6%B0%C6%A1ng_qu%E1%BB%91c_gi%C3%B3.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 15: Cuộc phiêu lưu ở Xứ sở Nghìn lẻ một đêm", "Thế giới Nghìn lẻ một đêm", 64, "1991-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/-c4-90-c3-aam-truy-e1-bb-87n-d-c3-a0i_d5199fa0c4fe492ab3ccebada0685094_49f42c39a8be4340ba0ce26643d07715_1024x1024.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 16: Chuyến tàu tốc hành ngân hà", "Du hành vũ trụ bằng tàu hỏa", 62, "1996-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-truyen-dai-tap-16_8f959adc4ba148f3a657fa1b2cd108d9.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 17: Truyền thuyết về vua mặt trời", "Khám phá nền văn minh cổ đại", 60, "2000-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/Nobita_va_truyen_thuyet_vua_mat_troi.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 18: Lịch sử khai phá miền Tây", "Lập nghiệp ở miền Tây", 58, "2001-01-01", "https://upload.wikimedia.org/wikipedia/vi/b/b1/Eiga_Doraemon_Shin_Nobita_No_Uchu_Kaitaku_Shi.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 19: Cuộc chiến ngoài hành tinh", "Chiến đấu với người ngoài hành tinh", 56, "1985-08-01", "https://upload.wikimedia.org/wikipedia/vi/8/8f/T%C3%AAn_%C4%91%E1%BB%99c_t%C3%A0i_v%C5%A9_tr%E1%BB%A5.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 20: Viện bảo tàng bảo bối bí mật", "Kho báu bí ẩn của Doraemon", 54, "2013-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(15).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 21: Hòn đảo kỳ bí", "Phiêu lưu trên đảo hoang", 52, "1998-01-01", "https://upload.wikimedia.org/wikipedia/vi/c/cc/H%C3%B2n_%C4%91%E1%BA%A3o_di%E1%BB%87u_k%C3%AC.jpeg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 22: Nobita và những bạn khủng long mới", "Gặp lại những chú khủng long", 50, "2006-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(13).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 23: Cuộc phiêu lưu trên đảo giấu vàng", "Tìm kho báu trên đảo", 48, "2018-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/14778-doraemon-cuoc-phieu-luu-den-dao-giau-vang-1.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 24: Chú chó của Nobita và cuộc phiêu lưu châu Phi", "Phiêu lưu ở châu Phi", 46, "1998-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(12).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 25: Nobita ở vương quốc Rô-bốt", "Thế giới robot", 44, "2002-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(5).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 26: Nobita và hành tinh màu tím", "Hành tinh bí ẩn", 42, "1990-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(11).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 27: Nobita và binh đoàn người sắt mới", "Phần tiếp theo binh đoàn người sắt", 40, "2011-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(10).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 28: Người cá ngoài đại dương", "Đại dương xanh thẳm", 38, "2010-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(9).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 29: Nobita và chuyến thám hiểm Nam Cực", "Khám phá Nam Cực", 36, "2017-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(8).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 30: Người sinh sống trên mặt trăng", "Cuộc sống trên mặt trăng", 34, "2019-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(7).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 31: Nobita và chuyến tàu thời gian", "Du hành xuyên thời gian", 32, "1987-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(6).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 32: Nobita và những dũng sĩ có cánh", "Thế giới có cánh", 30, "2001-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(7).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 33: Nobita và hành tinh động vật", "Hành tinh của động vật", 28, "1990-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-tap-10---nobita-va-hanh-tinh-muong-thu---tb-2023.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 34: Nobita và vùng đất lý tưởng trên bầu trời", "Xây dựng thiên đường", 26, "2016-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(5).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 35: Nobita và người khổng lồ xanh", "Cuộc phiêu lưu với người khổng lồ", 24, "2008-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/8935244878202.webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 36: Nobita và chuyến du hành biển phương Nam", "Thám hiểm biển phương Nam", 22, "1998-08-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/Truy-n-doremon-dai-t-p-du-hanh-bi-n-ph-ng-nam-1-2048.webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 37: Nobita và những hiệp sĩ rô-bốt", "Hiệp sĩ thời đại mới", 20, "2014-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/shopping%20(2)%20(1).webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 38: Nobita và Nước Nhật thời nguyên thủy", "Du hành về thời tiền sử", 18, "1989-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/dai_9_0c60f94482714499bb6f8432f9ad6af0_master.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 39: Nobita và Chú khủng long mới", "Chú khủng long được sinh ra", 16, "2020-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-truyen-dai-1-chu-khung-long-cua-nobita_27a58b414f0644ea9f510ab240d9b58d.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 40: Nobita và những thợ săn vàng", "Săn tìm kho báu", 14, "1994-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(4).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 41: Nobita và vương quốc trên mây", "Tái hiện vương quốc trên mây", 12, "2023-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/8cbf9ec4321c4.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 42: Nobita và bản giao hương Địa Cầu", "Cứu lấy Trái Đất", 10, "2024-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(3).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 43: Nobita ở đảo giấu vàng", "Phiên bản mới đảo giấu vàng", 8, "2018-08-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(2).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 44: Nobita và Mặt Trăng phiêu lưu ký", "Phiêu lưu trên mặt trăng", 6, "2019-08-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/shopping%20(1)%20(1).webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 45: Nobita và cuộc đại thủy chiến", "Chiến đấu dưới nước", 4, "2010-08-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/shopping.webp")
    };

    private static class TextbookData {
        String name;
        String desc;
        double cost;
        int stock;
        String image;
        int grade;

        TextbookData(String name, String desc, double cost, int stock, String image, int grade) {
            this.name = name;
            this.desc = desc;
            this.cost = cost;
            this.stock = stock;
            this.image = image;
            this.grade = grade;
        }
    }

    private static final TextbookData[] TEXTBOOK_BOOKS = {
        new TextbookData("Toán 1", "Sách giáo khoa Toán lớp 1", 15000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/AHc89lMuEtkPbVIlJQNWZIYItWNZQ3s5.jpg", 1),
        new TextbookData("Tiếng Việt 1", "Sách giáo khoa Tiếng Việt lớp 1", 20000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(9).jpg", 1),
        new TextbookData("Toán 2", "Sách giáo khoa Toán lớp 2", 15000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(10).jpg", 2),
        new TextbookData("Tiếng Việt 2", "Sách giáo khoa Tiếng Việt lớp 2", 20000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/download%20(1).jpg", 2),
        new TextbookData("Toán 3", "Sách giáo khoa Toán lớp 3", 16000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/toan-3.jpg", 3),
        new TextbookData("Tiếng Việt 3", "Sách giáo khoa Tiếng Việt lớp 3", 21000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786044344027.jpg", 3),
        new TextbookData("Lịch Sử và Địa lý 3", "Sách giáo khoa Lịch Sử và Địa lý lớp 3", 18000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_214054.jpg", 3),
        new TextbookData("Toán 4", "Sách giáo khoa Toán lớp 4", 17000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/8/9/8931805646228.jpg", 4),
        new TextbookData("Tiếng Việt 4", "Sách giáo khoa Tiếng Việt lớp 4", 22000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786044344034.jpg", 4),
        new TextbookData("Lịch Sử và Địa lý 4", "Sách giáo khoa Lịch Sử và Địa lý lớp 4", 19000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/z/7/z7842324971942_3f699fb1c5abedd0f482f470d0909d29.jpg", 4),
        new TextbookData("Toán 5", "Sách giáo khoa Toán lớp 5", 18000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/bc1bf9ca-2c59-43f3-95f0-9a7ba916d636-download%20(5).jpg", 5),
        new TextbookData("Tiếng Việt 5", "Sách giáo khoa Tiếng Việt lớp 5", 23000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040392268.jpg", 5),
        new TextbookData("Lịch Sử và Địa lý 5", "Sách giáo khoa Lịch Sử và Địa lý lớp 5", 20000.0, 200, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040392923.jpg", 5),
        new TextbookData("Toán 6", "Sách giáo khoa Toán lớp 6", 25000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_244718_1_4889_thanh_ly.jpg", 6),
        new TextbookData("Ngữ Văn 6", "Sách giáo khoa Ngữ Văn lớp 6", 28000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786043097566_1.jpg", 6),
        new TextbookData("Lịch Sử 6", "Sách giáo khoa Lịch Sử lớp 6", 22000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-momwbaswkge9ec", 6),
        new TextbookData("Toán 7", "Sách giáo khoa Toán lớp 7", 26000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjqj9rs2tb7od0.webp", 7),
        new TextbookData("Ngữ Văn 7", "Sách giáo khoa Ngữ Văn lớp 7", 29000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-ch_ng-t_c-v_-l_ch-s_.jpg", 7),
        new TextbookData("Lịch Sử 7", "Sách giáo khoa Lịch Sử lớp 7", 23000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-momwbaswkge9ec", 7),
        new TextbookData("Toán 8", "Sách giáo khoa Toán lớp 8", 27000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-ml9i2fx5ob9gaf.webp", 8),
        new TextbookData("Ngữ Văn 8", "Sách giáo khoa Ngữ Văn lớp 8", 30000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-momw6akl6v4ef3", 8),
        new TextbookData("Lịch Sử 8", "Sách giáo khoa Lịch Sử lớp 8", 24000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m849fi1awlm6e1_tn", 8),
        new TextbookData("Vật Lý 8", "Sách giáo khoa Vật Lý lớp 8", 25000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-momw6akl6v4ef3", 8),
        new TextbookData("Toán 9", "Sách giáo khoa Toán lớp 9", 28000.0, 180, "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-momwbaswkge9ec", 9),
        new TextbookData("Ngữ Văn 9", "Sách giáo khoa Ngữ Văn lớp 9", 31000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040284037_1_thanh_ly.jpg", 9),
        new TextbookData("Lịch Sử 9", "Sách giáo khoa Lịch Sử lớp 9", 25000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040435255.jpg", 9),
        new TextbookData("Vật Lý 9", "Sách giáo khoa Vật Lý lớp 9", 26000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_244718_1_4020.jpg", 9),
        new TextbookData("Hóa Học 9", "Sách giáo khoa Hóa Học lớp 9", 26000.0, 180, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_47983.jpg", 9),
        new TextbookData("Toán 10", "Sách giáo khoa Toán lớp 10", 32000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/8/9/8936036316810.jpg", 10),
        new TextbookData("Ngữ Văn 10", "Sách giáo khoa Ngữ Văn lớp 10", 35000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_121438.jpg", 10),
        new TextbookData("Lịch Sử 10", "Sách giáo khoa Lịch Sử lớp 10", 28000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/z/7/z7842324971940_cbf9d37da29df4c2e5f313a7e1e50230.jpg", 10),
        new TextbookData("Vật Lý 10", "Sách giáo khoa Vật Lý lớp 10", 30000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/8/9/8936036316520.jpg", 10),
        new TextbookData("Hóa Học 10", "Sách giáo khoa Hóa Học lớp 10", 30000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/8/9/8936214270262.jpg", 10),
        new TextbookData("Toán 11", "Sách giáo khoa Toán lớp 11", 33000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786320007912.jpg", 11),
        new TextbookData("Ngữ Văn 11", "Sách giáo khoa Ngữ Văn lớp 11", 36000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-ch_ng-t_c-v_-l_ch-s_.jpg", 11),
        new TextbookData("Lịch Sử 11", "Sách giáo khoa Lịch Sử lớp 11", 29000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-ch_ng-t_c-v_-l_ch-s_.jpg", 11),
        new TextbookData("Vật Lý 11", "Sách giáo khoa Vật Lý lớp 11", 31000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040466327.jpg", 11),
        new TextbookData("Hóa Học 11", "Sách giáo khoa Hóa Học lớp 11", 31000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_229603.jpg", 11),
        new TextbookData("Toán 12", "Sách giáo khoa Toán lớp 12", 35000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/8/9/8936036317527.jpg", 12),
        new TextbookData("Ngữ Văn 12", "Sách giáo khoa Ngữ Văn lớp 12", 38000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/i/m/image_65337_thanh_ly.jpg", 12),
        new TextbookData("Lịch Sử 12", "Sách giáo khoa Lịch Sử lớp 12", 30000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040392725.jpg", 12),
        new TextbookData("Vật Lý 12", "Sách giáo khoa Vật Lý lớp 12", 32000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/8/9/8935092547657.jpg", 12),
        new TextbookData("Hóa Học 12", "Sách giáo khoa Hóa Học lớp 12", 32000.0, 160, "https://cdn1.fahasa.com/media/catalog/product/9/7/9786040392503.jpg", 12)
    };

}
