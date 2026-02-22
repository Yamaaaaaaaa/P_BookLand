package com.example.bookland_be.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToWishlistRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;
}