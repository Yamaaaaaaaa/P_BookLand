package com.example.bookland_be.config;

import java.time.LocalDate;
import java.util.HashSet;

import com.example.bookland_be.constant.PredefinedRole;
import com.example.bookland_be.entity.Author;
import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.Category;
import com.example.bookland_be.entity.PaymentMethod;
import com.example.bookland_be.entity.Publisher;
import com.example.bookland_be.entity.Role;
import com.example.bookland_be.entity.Serie;
import com.example.bookland_be.entity.ShippingMethod;
import com.example.bookland_be.entity.Supplier;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.repository.AuthorRepository;
import com.example.bookland_be.repository.BookRepository;
import com.example.bookland_be.repository.CategoryRepository;
import com.example.bookland_be.repository.PaymentMethodRepository;
import com.example.bookland_be.repository.PublisherRepository;
import com.example.bookland_be.repository.RoleRepository;
import com.example.bookland_be.repository.SerieRepository;
import com.example.bookland_be.repository.ShippingMethodRepository;
import com.example.bookland_be.repository.SupplierRepository;
import com.example.bookland_be.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

// Tác dụng: Tạo sẵn các DB mặc đinh, tránh dữ liệu trống phải đi import tay
// Gồm: 1 User mặc định admin-admin, quyền ADMIN, các role, author, publisher, serie, category và book mặc định

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    @Autowired
    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner applicationRunner(
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuthorRepository authorRepository,
            PublisherRepository publisherRepository,
            SerieRepository serieRepository,
            CategoryRepository categoryRepository,
            BookRepository bookRepository,
            ShippingMethodRepository shippingMethodRepository,
            PaymentMethodRepository paymentMethodRepository,
            SupplierRepository supplierRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                System.out.println("CẦN TAO ADMIN VÀ KHỞI TẠO DỮ LIỆU BAN ĐẦU");

                // 1. Tạo các role
                Role userRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .description("User role - Khách hàng")
                        .build());

                Role adminRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_ROLE)
                        .description("Admin role - Quản trị toàn bộ hệ thống")
                        .build());

                Role managerRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.MANAGER_ROLE)
                        .description("Manager role - Quản lý toàn bộ hệ thống")
                        .build());

                Role orderStaffRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ORDER_STAFF_ROLE)
                        .description("Order Staff role - Nhân viên xử lý đơn hàng")
                        .build());

                Role serviceSupporterRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.SERVICE_SUPPORTER_ROLE)
                        .description("Service Supporter role - Nhân viên hỗ trợ khách hàng")
                        .build());

                Role adminLoginRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_LOGIN_ROLE)
                        .description("Admin Login role - Nhân viên hỗ trợ khách hàng")
                        .build());

                Role shipperRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.SHIPPER_ROLE)
                        .description("Shipper role - Nhân viên giao hàng")
                        .build());

                // 2. Tạo các users mặc định cho từng role
                var adminRoles = new HashSet<Role>();
                adminRoles.add(adminRole);
                adminRoles.add(adminLoginRole);
                User admin = User.builder()
                        .username(ADMIN_USER_NAME)
                        .email(ADMIN_USER_NAME + "@gmail.com")
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .roles(adminRoles)
                        .build();
                admin = userRepository.save(admin);
                log.warn("admin user has been created with default password: admin, please change it");

                var testUserRoles = new HashSet<Role>();
                testUserRoles.add(userRole);
                User testUser = User.builder()
                        .username("user")
                        .firstName("User")
                        .lastName("Test")
                        .dob(LocalDate.of(1995, 5, 15))
                        .email("user@gmail.com")
                        .password(passwordEncoder.encode("user"))
                        .phone("0907654321")
                        .roles(testUserRoles)
                        .build();
                userRepository.save(testUser);
                log.info("test user has been created with default password: user");

                var managerRoles = new HashSet<Role>();
                managerRoles.add(managerRole);
                managerRoles.add(adminLoginRole);
                User managerUser = User.builder()
                        .username("manager")
                        .firstName("Manager")
                        .lastName("System")
                        .email("manager@gmail.com")
                        .password(passwordEncoder.encode("manager"))
                        .roles(managerRoles)
                        .build();
                userRepository.save(managerUser);
                log.info("manager user has been created with default password: manager");

                var orderStaffRoles = new HashSet<Role>();
                orderStaffRoles.add(orderStaffRole);
                User orderStaffUser = User.builder()
                        .username("orderstaff")
                        .firstName("Staff")
                        .lastName("Order")
                        .email("orderstaff@gmail.com")
                        .password(passwordEncoder.encode("orderstaff"))
                        .roles(orderStaffRoles)
                        .build();
                userRepository.save(orderStaffUser);
                log.info("order staff user has been created with default password: orderstaff");

                var serviceSupporterRoles = new HashSet<Role>();
                serviceSupporterRoles.add(serviceSupporterRole);
                User serviceSupporterUser = User.builder()
                        .username("supporter")
                        .firstName("Supporter")
                        .lastName("Service")
                        .email("supporter@gmail.com")
                        .password(passwordEncoder.encode("supporter"))
                        .roles(serviceSupporterRoles)
                        .build();
                userRepository.save(serviceSupporterUser);
                log.info("service supporter user has been created with default password: supporter");

                var shipperRoles = new HashSet<Role>();
                shipperRoles.add(shipperRole);
                User shipperUser = User.builder()
                        .username("shipper")
                        .firstName("Shipper")
                        .lastName("Delivery")
                        .email("shipper@gmail.com")
                        .password(passwordEncoder.encode("shipper"))
                        .roles(shipperRoles)
                        .build();
                userRepository.save(shipperUser);
                log.info("shipper user has been created with default password: shipper");

                // 3. Tạo các author
                Author author1 = authorRepository.save(Author.builder()
                        .name("J.K. Rowling")
                        .description("Tác giả người Anh, nổi tiếng với series Harry Potter")
                        .authorImage("jk_rowling.jpg")
                        .build());
                Author author2 = authorRepository.save(Author.builder()
                        .name("Fujiko F. Fujio")
                        .description("Bút danh của Hiroshi Fujimoto, tác giả truyện Doraemon")
                        .authorImage("fujiko.jpg")
                        .build());
                Author author3 = authorRepository.save(Author.builder()
                        .name("Nguyễn Nhật Ánh")
                        .description("Nhà văn Việt Nam nổi tiếng với các tác phẩm thiếu nhi")
                        .authorImage("nguyen_nhat_anh.jpg")
                        .build());
                Author author4 = authorRepository.save(Author.builder()
                        .name("Bộ Giáo dục và Đào tạo")
                        .description("Tác giả các sách giáo khoa Việt Nam")
                        .authorImage("bgddt.jpg")
                        .build());
                log.info("Authors have been seeded.");

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
                        .publisher(publisher2) // NXB Trẻ (Harry Potter tiếng Việt được xuất bản bởi NXB Trẻ)
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
                        .bookImageUrl("https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/31b0f59e6131b88cf5f7d52870cc42a3.jpg")
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
                            .publisher(publisher1) // NXB Kim Đồng
                            .series(serie2)
                            .creator(admin)
                            .categories(doraemonCategories)
                            .build());
                }
                log.info("Doraemon books have been seeded.");

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
                            .author(author4) // Bộ Giáo dục và Đào tạo
                            .publisher(publisher3) // NXB Giáo dục Việt Nam
                            .series(gradeSeries[data.grade - 1])
                            .creator(admin)
                            .categories(textbookCategories)
                            .build());
                }
                log.info("Textbook books have been seeded.");

                // 10. Tạo các sách lẻ - Nguyễn Nhật Ánh
                var nnaCategories = new HashSet<Category>();
                nnaCategories.add(category5); // Văn học Việt Nam

                bookRepository.save(Book.builder()
                        .name("Tôi thấy hoa vàng trên cỏ xanh")
                        .description("Câu chuyện tuổi thơ miền Trung")
                        .originalCost(90000.0)
                        .sale(15.0)
                        .stock(120)
                        .publishedDate(LocalDate.of(2010, 12, 1))
                        .bookImageUrl("nna_hoa_vang.jpg")
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
                        .bookImageUrl("nna_mat_biec.jpg")
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
                        .bookImageUrl("nna_ve_tuoi_tho.jpg")
                        .pin(false)
                        .author(author3)
                        .publisher(publisher2)
                        .series(null)
                        .creator(admin)
                        .categories(nnaCategories)
                        .build());

                log.info("Nguyễn Nhật Ánh books have been seeded.");

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
            }
            log.info("Application initialization completed .....");
        };
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
        new DoraemonBookData("Doraemon - Truyện dài - Tập 3: Lâu đài dưới đáy biển", "Khám phá đại dương", 90, "1983-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(10).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 4: Xứ sở ma thuật", "Thế giới phép thuật kỳ diệu", 88, "1984-01-01", "dora_td4.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 5: Chuyến phiêu lưu ở miền Tây hoang dã", "Cuộc phiêu lưu miền Viễn Tây", 85, "1982-01-01", "dora_td5.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 6: Cuộc đại thủy chiến ở xứ sở người cá", "Thế giới dưới nước", 82, "1983-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon_-_nobita_va_cuoc_chien_dai_thuy_o_xu_so_nguoi_ca_-_tb_2020_dd53b454cee444e6a6a4b03c35e4c3f7_1024x1024.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 7: Binh đoàn người sắt", "Robot xâm lược Trái Đất", 80, "1986-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(4).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 8: Những hiệp sĩ không gian", "Chiến đấu trong vũ trụ", 78, "1985-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(9).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 9: Vua quỷ ở thành phố ngầm", "Thế giới ngầm bí ẩn", 76, "1983-08-01", "dora_td9.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 10: Cuộc chiến ở xứ sở người bé nhỏ", "Nobita bị teo nhỏ", 74, "1985-03-01", "dora_td10.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 11: Cuộc phiêu lưu vào rừng xanh", "Phiêu lưu trong rừng nhiệt đới", 72, "1992-01-01", "dora_td11.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 12: Vương quốc trên mây", "Thế giới trên mây", 70, "1992-03-01", "dora_td12.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 13: Mê cung thiếc", "Cuộc phiêu lưu trong mê cung", 68, "1993-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/21f9c55bb574784671984443bb3d2bc5.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 14: Những vị thần bí ẩn", "Hành tinh thần bí", 66, "1997-01-01", "dora_td14.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 15: Cuộc phiêu lưu ở Xứ sở Nghìn lẻ một đêm", "Thế giới Nghìn lẻ một đêm", 64, "1991-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/-c4-90-c3-aam-truy-e1-bb-87n-d-c3-a0i_d5199fa0c4fe492ab3ccebada0685094_49f42c39a8be4340ba0ce26643d07715_1024x1024.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 16: Chuyến tàu tốc hành ngân hà", "Du hành vũ trụ bằng tàu hỏa", 62, "1996-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-truyen-dai-tap-16_8f959adc4ba148f3a657fa1b2cd108d9.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 17: Truyền thuyết về vua mặt trời", "Khám phá nền văn minh cổ đại", 60, "2000-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/Nobita_va_truyen_thuyet_vua_mat_troi.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 18: Lịch sử khai phá miền Tây", "Lập nghiệp ở miền Tây", 58, "2001-01-01", "dora_td18.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 19: Cuộc chiến ngoài hành tinh", "Chiến đấu với người ngoài hành tinh", 56, "1985-08-01", "dora_td19.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 20: Viện bảo tàng bảo bối bí mật", "Kho báu bí ẩn của Doraemon", 54, "2013-01-01", "dora_td20.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 21: Hòn đảo kỳ bí", "Phiêu lưu trên đảo hoang", 52, "1998-01-01", "dora_td21.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 22: Nobita và những bạn khủng long mới", "Gặp lại những chú khủng long", 50, "2006-01-01", "dora_td22.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 23: Cuộc phiêu lưu trên đảo giấu vàng", "Tìm kho báu trên đảo", 48, "2018-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/14778-doraemon-cuoc-phieu-luu-den-dao-giau-vang-1.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 24: Chú chó của Nobita và cuộc phiêu lưu châu Phi", "Phiêu lưu ở châu Phi", 46, "1998-03-01", "dora_td24.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 25: Nobita ở vương quốc Rô-bốt", "Thế giới robot", 44, "2002-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(5).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 26: Nobita và hành tinh màu tím", "Hành tinh bí ẩn", 42, "1990-01-01", "dora_td26.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 27: Nobita và binh đoàn người sắt mới", "Phần tiếp theo binh đoàn người sắt", 40, "2011-01-01", "dora_td27.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 28: Người cá ngoài đại dương", "Đại dương xanh thẳm", 38, "2010-01-01", "dora_td28.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 29: Nobita và chuyến thám hiểm Nam Cực", "Khám phá Nam Cực", 36, "2017-01-01", "dora_td29.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 30: Người sinh sống trên mặt trăng", "Cuộc sống trên mặt trăng", 34, "2019-01-01", "dora_td30.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 31: Nobita và chuyến tàu thời gian", "Du hành xuyên thời gian", 32, "1987-01-01", "dora_td31.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 32: Nobita và những dũng sĩ có cánh", "Thế giới có cánh", 30, "2001-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/images%20(7).jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 33: Nobita và hành tinh động vật", "Hành tinh của động vật", 28, "1990-03-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-tap-10---nobita-va-hanh-tinh-muong-thu---tb-2023.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 34: Nobita và vùng đất lý tưởng trên bầu trời", "Xây dựng thiên đường", 26, "2016-01-01", "dora_td34.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 35: Nobita và người khổng lồ xanh", "Cuộc phiêu lưu với người khổng lồ", 24, "2008-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/8935244878202.webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 36: Nobita và chuyến du hành biển phương Nam", "Thám hiểm biển phương Nam", 22, "1998-08-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/Truy-n-doremon-dai-t-p-du-hanh-bi-n-ph-ng-nam-1-2048.webp"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 37: Nobita và những hiệp sĩ rô-bốt", "Hiệp sĩ thời đại mới", 20, "2014-01-01", "dora_td37.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 38: Nobita và Nước Nhật thời nguyên thủy", "Du hành về thời tiền sử", 18, "1989-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/dai_9_0c60f94482714499bb6f8432f9ad6af0_master.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 39: Nobita và Chú khủng long mới", "Chú khủng long được sinh ra", 16, "2020-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/doraemon-truyen-dai-1-chu-khung-long-cua-nobita_27a58b414f0644ea9f510ab240d9b58d.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 40: Nobita và những thợ săn vàng", "Săn tìm kho báu", 14, "1994-01-01", "dora_td40.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 41: Nobita và vương quốc trên mây", "Tái hiện vương quốc trên mây", 12, "2023-01-01", "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/8cbf9ec4321c4.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 42: Nobita và bản giao hưởng Địa Cầu", "Cứu lấy Trái Đất", 10, "2024-01-01", "dora_td42.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 43: Nobita ở đảo giấu vàng", "Phiên bản mới đảo giấu vàng", 8, "2018-08-01", "dora_td43.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 44: Nobita và Mặt Trăng phiêu lưu ký", "Phiêu lưu trên mặt trăng", 6, "2019-08-01", "dora_td44.jpg"),
        new DoraemonBookData("Doraemon - Truyện dài - Tập 45: Nobita và cuộc đại thủy chiến", "Chiến đấu dưới nước", 4, "2010-08-01", "dora_td45.jpg")
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
        new TextbookData("Tiếng Việt 3", "Sách giáo khoa Tiếng Việt lớp 3", 21000.0, 200, "sgk_tv3.jpg", 3),
        new TextbookData("Lịch Sử và Địa lý 3", "Sách giáo khoa Lịch Sử và Địa lý lớp 3", 18000.0, 200, "sgk_ls3.jpg", 3),
        new TextbookData("Toán 4", "Sách giáo khoa Toán lớp 4", 17000.0, 200, "sgk_toan4.jpg", 4),
        new TextbookData("Tiếng Việt 4", "Sách giáo khoa Tiếng Việt lớp 4", 22000.0, 200, "sgk_tv4.jpg", 4),
        new TextbookData("Lịch Sử và Địa lý 4", "Sách giáo khoa Lịch Sử và Địa lý lớp 4", 19000.0, 200, "sgk_ls4.jpg", 4),
        new TextbookData("Toán 5", "Sách giáo khoa Toán lớp 5", 18000.0, 200, "https://scvvtnvriucbhkrstung.supabase.co/storage/v1/object/public/book-images/bc1bf9ca-2c59-43f3-95f0-9a7ba916d636-download%20(5).jpg", 5),
        new TextbookData("Tiếng Việt 5", "Sách giáo khoa Tiếng Việt lớp 5", 23000.0, 200, "sgk_tv5.jpg", 5),
        new TextbookData("Lịch Sử và Địa lý 5", "Sách giáo khoa Lịch Sử và Địa lý lớp 5", 20000.0, 200, "sgk_ls5.jpg", 5),
        new TextbookData("Toán 6", "Sách giáo khoa Toán lớp 6", 25000.0, 180, "sgk_toan6.jpg", 6),
        new TextbookData("Ngữ Văn 6", "Sách giáo khoa Ngữ Văn lớp 6", 28000.0, 180, "sgk_van6.jpg", 6),
        new TextbookData("Lịch Sử 6", "Sách giáo khoa Lịch Sử lớp 6", 22000.0, 180, "sgk_ls6.jpg", 6),
        new TextbookData("Toán 7", "Sách giáo khoa Toán lớp 7", 26000.0, 180, "sgk_toan7.jpg", 7),
        new TextbookData("Ngữ Văn 7", "Sách giáo khoa Ngữ Văn lớp 7", 29000.0, 180, "sgk_van7.jpg", 7),
        new TextbookData("Lịch Sử 7", "Sách giáo khoa Lịch Sử lớp 7", 23000.0, 180, "sgk_ls7.jpg", 7),
        new TextbookData("Toán 8", "Sách giáo khoa Toán lớp 8", 27000.0, 180, "sgk_toan8.jpg", 8),
        new TextbookData("Ngữ Văn 8", "Sách giáo khoa Ngữ Văn lớp 8", 30000.0, 180, "sgk_van8.jpg", 8),
        new TextbookData("Lịch Sử 8", "Sách giáo khoa Lịch Sử lớp 8", 24000.0, 180, "sgk_ls8.jpg", 8),
        new TextbookData("Vật Lý 8", "Sách giáo khoa Vật Lý lớp 8", 25000.0, 180, "sgk_ly8.jpg", 8),
        new TextbookData("Toán 9", "Sách giáo khoa Toán lớp 9", 28000.0, 180, "sgk_toan9.jpg", 9),
        new TextbookData("Ngữ Văn 9", "Sách giáo khoa Ngữ Văn lớp 9", 31000.0, 180, "sgk_van9.jpg", 9),
        new TextbookData("Lịch Sử 9", "Sách giáo khoa Lịch Sử lớp 9", 25000.0, 180, "sgk_ls9.jpg", 9),
        new TextbookData("Vật Lý 9", "Sách giáo khoa Vật Lý lớp 9", 26000.0, 180, "sgk_ly9.jpg", 9),
        new TextbookData("Hóa Học 9", "Sách giáo khoa Hóa Học lớp 9", 26000.0, 180, "sgk_hoa9.jpg", 9),
        new TextbookData("Toán 10", "Sách giáo khoa Toán lớp 10", 32000.0, 160, "sgk_toan10.jpg", 10),
        new TextbookData("Ngữ Văn 10", "Sách giáo khoa Ngữ Văn lớp 10", 35000.0, 160, "sgk_van10.jpg", 10),
        new TextbookData("Lịch Sử 10", "Sách giáo khoa Lịch Sử lớp 10", 30000.0, 160, "sgk_ls10.jpg", 10),
        new TextbookData("Vật Lý 10", "Sách giáo khoa Vật Lý lớp 10", 31000.0, 160, "sgk_ly10.jpg", 10),
        new TextbookData("Hóa Học 10", "Sách giáo khoa Hóa Học lớp 10", 31000.0, 160, "sgk_hoa10.jpg", 10),
        new TextbookData("Toán 11", "Sách giáo khoa Toán lớp 11", 33000.0, 160, "sgk_toan11.jpg", 11),
        new TextbookData("Ngữ Văn 11", "Sách giáo khoa Ngữ Văn lớp 11", 36000.0, 160, "sgk_van11.jpg", 11),
        new TextbookData("Lịch Sử 11", "Sách giáo khoa Lịch Sử lớp 11", 31000.0, 160, "sgk_ls11.jpg", 11),
        new TextbookData("Vật Lý 11", "Sách giáo khoa Vật Lý lớp 11", 32000.0, 160, "sgk_ly11.jpg", 11),
        new TextbookData("Hóa Học 11", "Sách giáo khoa Hóa Học lớp 11", 32000.0, 160, "sgk_hoa11.jpg", 11),
        new TextbookData("Toán 12", "Sách giáo khoa Toán lớp 12", 34000.0, 160, "sgk_toan12.jpg", 12),
        new TextbookData("Ngữ Văn 12", "Sách giáo khoa Ngữ Văn lớp 12", 37000.0, 160, "sgk_van12.jpg", 12),
        new TextbookData("Lịch Sử 12", "Sách giáo khoa Lịch Sử lớp 12", 32000.0, 160, "sgk_ls12.jpg", 12),
        new TextbookData("Vật Lý 12", "Sách giáo khoa Vật Lý lớp 12", 33000.0, 160, "sgk_ly12.jpg", 12),
        new TextbookData("Hóa Học 12", "Sách giáo khoa Hóa Học lớp 12", 33000.0, 160, "sgk_hoa12.jpg", 12)
    };

}