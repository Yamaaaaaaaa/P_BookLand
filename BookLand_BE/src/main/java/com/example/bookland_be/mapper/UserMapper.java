package com.example.bookland_be.mapper;

import com.example.bookland_be.dto.request.UserCreationRequest;
import com.example.bookland_be.dto.request.UserUpdateRequest;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    UserResponse toUserResponse(User user);
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}