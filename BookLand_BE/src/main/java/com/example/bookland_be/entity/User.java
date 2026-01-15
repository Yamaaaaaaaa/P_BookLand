package com.example.bookland_be.entity;

import java.time.LocalDate;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder // Khai báo để các bên khác tạo Entity dễ hơn
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "users") // tên bảng trong MySQL
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true, length = 255)
    String email;

    @Column(nullable = false, length = 255)
    String password;

    @Column(nullable = false, length = 255)
    String username;

    @Column(nullable = false, length = 255)
    String firstName;

    @Column(nullable = false, length = 255)
    String lastName;

    LocalDate dob; // DATE trong MySQL → LocalDate

    @ManyToMany
    Set<Role> roles;

    @Column(nullable = false, unique = true, length = 255)
    String userId; // Sử dụng cho oauth keycloak
}
