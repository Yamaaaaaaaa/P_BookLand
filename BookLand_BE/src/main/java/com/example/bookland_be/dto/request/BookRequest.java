package com.example.bookland_be.dto.request;


import com.example.bookland_be.entity.Book.BookStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookRequest {
    @NotBlank(message = "Book name is required")
    private String name;

    private String description;

    @NotNull(message = "Original cost is required")
    @Positive(message = "Original cost must be positive")
    private Double originalCost;

    @Min(value = 0, message = "Sale must be at least 0")
    @Max(value = 100, message = "Sale must be at most 100")
    private Double sale;

    @Min(value = 0, message = "Stock must be at least 0")
    private Integer stock;

    private BookStatus status;
    private LocalDate publishedDate;
    private String bookImageUrl;
    private Boolean pin;

    @NotNull(message = "Author is required")
    private Long authorId;

    @NotNull(message = "Publisher is required")
    private Long publisherId;

    private Long seriesId;
    private Set<Long> categoryIds;
}
