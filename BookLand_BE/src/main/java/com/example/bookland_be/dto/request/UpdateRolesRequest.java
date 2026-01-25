
// UpdateRolesRequest.java
package com.example.bookland_be.dto.request;

import lombok.*;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRolesRequest {

    @NotEmpty(message = "Danh sách role không được để trống")
    private Set<Long> roleIds;
}