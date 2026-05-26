package com.example.bookland_be.repository;

import com.example.bookland_be.entity.ChatbotKnowledge;
import com.example.bookland_be.entity.ChatbotKnowledge.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotKnowledgeRepository extends JpaRepository<ChatbotKnowledge, Integer> {

    /** Lấy knowledge theo category, sắp xếp theo priority giảm dần */
    List<ChatbotKnowledge> findByIsActiveTrueAndCategoryOrderByPriorityDesc(KnowledgeCategory category);

    /** Tìm kiếm full-text (MySQL FULLTEXT) */
    @Query(value = "SELECT * FROM chatbot_knowledge " +
                   "WHERE is_active = true " +
                   "AND MATCH(title, content, keywords) AGAINST(:query IN BOOLEAN MODE) " +
                   "ORDER BY priority DESC LIMIT 5",
           nativeQuery = true)
    List<ChatbotKnowledge> searchByFullText(@Param("query") String query);

    /** Lấy tất cả knowledge active cho chatbot context */
    List<ChatbotKnowledge> findByIsActiveTrueOrderByPriorityDesc();
}
