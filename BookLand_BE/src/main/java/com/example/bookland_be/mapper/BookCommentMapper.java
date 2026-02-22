package com.example.bookland_be.mapper;

import com.example.bookland_be.dto.response.BookCommentResponse;
import com.example.bookland_be.entity.BookComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookCommentMapper {

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", expression = "java(comment.getUser().getLastName() != null && comment.getUser().getFirstName() != null ? comment.getUser().getLastName() + \" \" + comment.getUser().getFirstName() : comment.getUser().getUsername())")
    @Mapping(target = "billId", source = "bill.id")
    BookCommentResponse toResponse(BookComment comment);
}
