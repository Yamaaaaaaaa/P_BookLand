package com.example.bookland_be.service;


import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.entity.Role;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.repository.RoleRepository;
import com.example.bookland_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        // Validate username và email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        // Lấy roles
        Set<Role> roles = new HashSet<>();
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            roles = roleRepository.findByIdIn(request.getRoleIds());
            if (roles.size() != request.getRoleIds().size()) {
                throw new RuntimeException("Một số role không tồn tại");
            }
        }

        // Tạo user mới
        User user = User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dob(request.getDob())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .status(User.UserStatus.ENABLE)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

        // Validate email nếu thay đổi
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // Update các field
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional
    public UserResponse updateUserRoles(Long id, UpdateRolesRequest request) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

        // Lấy roles mới
        Set<Role> newRoles = roleRepository.findByIdIn(request.getRoleIds());
        if (newRoles.size() != request.getRoleIds().size()) {
            throw new RuntimeException("Một số role không tồn tại");
        }

        // Cập nhật roles
        user.setRoles(newRoles);
        User updatedUser = userRepository.save(user);

        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy user với id: " + id);
        }
        userRepository.deleteById(id);
    }
}
