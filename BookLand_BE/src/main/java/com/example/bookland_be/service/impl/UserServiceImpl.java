package com.example.bookland_be.service.impl;

import java.util.List;


import com.example.bookland_be.dto.request.UserCreationRequest;
import com.example.bookland_be.dto.request.UserUpdateRequest;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.mapper.UserMapper;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.UserService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import lombok.AccessLevel;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    UserMapper userMapper;


    @PreAuthorize("hasRole('ADMIN')")
    @Cacheable(value = "USER_CACHE", key = "'allUser'") // Lưu key cố định là All USER => Khi update, delete, create thì phải xóa cache cái này đi
    @Override
    public List<UserResponse> handleGetAllUser() {
        System.out.println("===============Ko co cache, vo day ne");
        List<User> users = (List<User>) this.userRepository.findAll();

        // Nên Map sang DPT
        return users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getLastName(),
                        user.getFirstName(),
                        user.getEmail(),
                        user.getDob(), null
                ))
                .toList();
    }

    @Cacheable(value = "USER_CACHE", key = "'user_'+#id") // Cache User theo ID
    @Override
    public UserResponse getUserById(Long id) {
        // TODO Auto-generated method stub
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return userMapper.toUserResponse(user);
    }

    // Create user → clear cả allUser và các user lẻ luôn :v- ko tối ưu lắm ha
    @CacheEvict(value = "USER_CACHE", allEntries = true)
    @Override
    public UserResponse handleCreateUser(UserCreationRequest userCreationRequestDTO){
        // TODO Auto-generated method stub
        if (userRepository.findByEmail(userCreationRequestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (userRepository.findByUsername(userCreationRequestDTO.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        // Mã hóa mật khẩu
        String hashedPassword = passwordEncoder.encode(userCreationRequestDTO.getPassword());
        userCreationRequestDTO.setPassword(hashedPassword);

        User user = userMapper.toUser(userCreationRequestDTO);

        User saved = userRepository.save(user);

        return userMapper.toUserResponse(saved);
    }

    @PreAuthorize("hasRole('POST_READ')")
    // Update user → clear cả allUser và các user lẻ luôn :v- ko tối ưu lắm ha
    @CacheEvict(value = "USER_CACHE", allEntries = true)
    public UserResponse handleUpdateUser(Long userId, UserUpdateRequest userUpdateRequestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check username/email uniqueness
        if (userUpdateRequestDTO.getName() != null && !userUpdateRequestDTO.getName().equals(user.getUsername())) {
            if (userRepository.findByUsername(userUpdateRequestDTO.getName()).isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(userUpdateRequestDTO.getName());
        }

        if (userUpdateRequestDTO.getEmail() != null && !userUpdateRequestDTO.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(userUpdateRequestDTO.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(userUpdateRequestDTO.getEmail());
        }

        if (userUpdateRequestDTO.getPassword() != null && !userUpdateRequestDTO.getPassword().isBlank()) {
            user.setPassword(userUpdateRequestDTO.getPassword());
        }

        if (userUpdateRequestDTO.getDob() != null) {
            user.setDob(userUpdateRequestDTO.getDob());
        }

        User saved = userRepository.save(user);

        return userMapper.toUserResponse(saved);
    }


    // Delete user → clear cả allUser và các user lẻ luôn :v- ko tối ưu lắm ha
    @CacheEvict(value = "USER_CACHE", allEntries = true)
    @Override
    public void handleDeleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }


    private UserResponse convertToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getLastName(),
                user.getFirstName(), user.getDob(), null
        );
    }
}