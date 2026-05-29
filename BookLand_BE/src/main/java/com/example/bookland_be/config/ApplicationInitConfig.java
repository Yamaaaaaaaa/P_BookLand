package com.example.bookland_be.config;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import com.example.bookland_be.constant.PredefinedRole;
import com.example.bookland_be.entity.HomeSection;
import com.example.bookland_be.entity.Role;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.repository.HomeSectionRepository;
import com.example.bookland_be.repository.RoleRepository;
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

// Tác dụng: Tạo sẵn các DB mặc đinh (Roles & Users), tránh dữ liệu trống phải đi import tay
// Gồm: Các Role và các User mặc định ứng với từng Role

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
            HomeSectionRepository homeSectionRepository) {
        log.info("Initializing application (Roles, Users & HomeSections).....");
        return args -> {
            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                log.info("Khởi tạo Roles và Users mặc định...");

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
            }
            log.info("Application initialization (Roles & Users) completed .....");

            // ─── Khởi tạo HomeSections mặc định nếu chưa có ───────────────────
            if (homeSectionRepository.count() == 0) {
                log.info("Seeding default home sections...");
                homeSectionRepository.saveAll(List.of(
                        HomeSection.builder()
                                .sectionKey("super_sale")
                                .nameVi("Super Sale")
                                .nameEn("Super Sale")
                                .icon("⚡")
                                .anchorId("super-sale-section")
                                .displayOrder(1)
                                .visible(true)
                                .build(),
                        HomeSection.builder()
                                .sectionKey("trending")
                                .nameVi("Xu Hướng")
                                .nameEn("Trending")
                                .icon("📈")
                                .anchorId("trending-section")
                                .displayOrder(2)
                                .visible(true)
                                .build(),
                        HomeSection.builder()
                                .sectionKey("featured")
                                .nameVi("Nổi Bật")
                                .nameEn("Featured")
                                .icon("🌟")
                                .anchorId("featured-section")
                                .displayOrder(3)
                                .visible(true)
                                .build(),
                        HomeSection.builder()
                                .sectionKey("best_seller")
                                .nameVi("Bán Chạy")
                                .nameEn("Best Sellers")
                                .icon("🏆")
                                .anchorId("bestseller-section")
                                .displayOrder(4)
                                .visible(true)
                                .build(),
                        HomeSection.builder()
                                .sectionKey("recommend")
                                .nameVi("Gợi Ý")
                                .nameEn("Recommendations")
                                .icon("💡")
                                .anchorId("recommendation-section")
                                .displayOrder(5)
                                .visible(true)
                                .build()
                ));
                log.info("Default home sections seeded successfully.");
            } else {
                log.info("Home sections already exist. Skipping seeding.");
            }
        };
    }
}