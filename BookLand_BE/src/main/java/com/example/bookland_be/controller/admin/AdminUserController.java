package com.example.bookland_be.controller.admin;

import com.example.bookland_be.dto.request.UserCreationRequest;
import com.example.bookland_be.dto.request.UserUpdateRequest;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users/")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@SecurityRequirement(name = "BearerAuth")
public class AdminUserController {
    private final UserService userService;
    public AdminUserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody @Valid UserCreationRequest userCreationRequestDto) {
        UserResponse newUsers = this.userService.handleCreateUser(userCreationRequestDto);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(newUsers);
        return ResponseEntity.ok().body(apiResponse);
    }
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.handleGetAllUser());
        return ResponseEntity.ok().body(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserById(id));
        return ResponseEntity.ok().body(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@PathVariable("id") Long id, @RequestBody @Valid UserUpdateRequest userUpdateRequestDto) {
        System.out.println("userUpdateRequestDto: "+ userUpdateRequestDto);
        UserResponse newUsers = this.userService.handleUpdateUser(id, userUpdateRequestDto);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(newUsers);
        return ResponseEntity.ok().body(apiResponse);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        this.userService.handleDeleteUser(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setResult("Delete User Completed");
        return ResponseEntity.ok().body(apiResponse);
    }
}
