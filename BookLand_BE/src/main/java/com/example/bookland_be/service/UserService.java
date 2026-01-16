package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.UpdateUserRoleRequest;
import com.example.bookland_be.dto.request.UserCreationRequest;
import com.example.bookland_be.dto.request.UserUpdateRequest;
import com.example.bookland_be.dto.response.UserResponse;

import java.util.List;


public interface UserService {
    List<UserResponse> handleGetAllUser();

    public UserResponse getUserById(Long id);

    public UserResponse handleCreateUser(UserCreationRequest userCreationRequestDTO);

    public UserResponse handleUpdateUser(Long userId, UserUpdateRequest userUpdateRequestDTO);

    public void handleDeleteUser(Long id);

    public UserResponse updateUserRoles(Long userId, UpdateUserRoleRequest req);
}