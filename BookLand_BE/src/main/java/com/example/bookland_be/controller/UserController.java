package com.example.bookland_be.controller;


import com.example.bookland_be.dto.request.UserCreationRequest;
import com.example.bookland_be.dto.request.UserUpdateRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.service.UserService;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody @Valid UserCreationRequest userCreationRequestDto) {
        UserResponse newUsers = this.userService.handleCreateUser(userCreationRequestDto);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(newUsers);
        return ResponseEntity.ok().body(apiResponse);
    }
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.handleGetAllUser());
        return ResponseEntity.ok().body(apiResponse);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserById(id));
        return ResponseEntity.ok().body(apiResponse);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@PathVariable("id") Long id, @RequestBody @Valid UserUpdateRequest userUpdateRequestDto) {
        System.out.println("userUpdateRequestDto: "+ userUpdateRequestDto);
        UserResponse newUsers = this.userService.handleUpdateUser(id, userUpdateRequestDto);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(newUsers);
        return ResponseEntity.ok().body(apiResponse);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        this.userService.handleDeleteUser(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setResult("Delete User Completed");
        return ResponseEntity.ok().body(apiResponse);
    }
}
