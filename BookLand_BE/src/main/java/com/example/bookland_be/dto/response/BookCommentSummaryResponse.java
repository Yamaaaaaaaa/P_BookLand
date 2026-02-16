package com.example.bookland_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookCommentSummaryResponse {
    private Double averageRating;
    private Long totalComments;
    private java.util.Map<Integer, Integer> ratingCounts;
    private Page<BookCommentResponse> comments;
}
