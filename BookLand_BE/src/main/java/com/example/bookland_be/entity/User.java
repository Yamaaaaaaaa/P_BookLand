package com.example.bookland_be.entity;

import java.time.LocalDate;
import java.util.Set;

import jakarta.persistence.*;
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

    @Column(nullable = true, length = 255)
    String firstName;

    @Column(nullable = true, length = 255)
    String lastName;

    @Column(nullable = true)
    LocalDate dob; // DATE trong MySQL → LocalDate

    @ManyToMany
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_name")
    )
    Set<Role> roles;
}
