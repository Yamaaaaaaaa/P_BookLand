package com.example.bookland_be.elasticsearch.repository;

import com.example.bookland_be.elasticsearch.document.BookDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookElasticsearchRepository extends ElasticsearchRepository<BookDocument, String> {

    // Sử dụng multi_match tìm kiếm toàn văn tối ưu trên nhiều trường, hỗ trợ tự động sửa lỗi chính tả (fuzziness)
    @Query("{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"name\", \"description\", \"authorName\", \"publisherName\"], \"fuzziness\": \"AUTO\"}}")
    Page<BookDocument> searchByKeyword(String keyword, Pageable pageable);
}
