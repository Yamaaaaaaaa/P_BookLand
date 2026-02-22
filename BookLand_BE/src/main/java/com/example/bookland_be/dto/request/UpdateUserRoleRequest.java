package com.example.bookland_be.dto.request;

import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRoleRequest {

    /**
     * VD: ["USER"], ["ADMIN"], ["USER","ADMIN"]
     */
    Set<String> roleNames;
}