package com.example.bookland_be.repository;

import com.example.bookland_be.entity.ChatbotSession;
import com.example.bookland_be.entity.ChatbotSession.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatbotSessionRepository extends JpaRepository<ChatbotSession, String> {

    /** Tìm session active của user đã đăng nhập */
    Optional<ChatbotSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(
        Long userId, SessionStatus status);

    /** Tìm session active của guest theo guest token */
    Optional<ChatbotSession> findFirstByGuestTokenAndStatusOrderByStartedAtDesc(
        String guestToken, SessionStatus status);

    /** Lấy tất cả session của một user */
    List<ChatbotSession> findByUserIdOrderByStartedAtDesc(Long userId);

    /** Kiểm tra session có thuộc về user không */
    @Query("SELECT COUNT(s) > 0 FROM ChatbotSession s WHERE s.id = :sessionId AND " +
           "(s.user.id = :userId OR s.guestToken = :guestToken)")
    boolean isSessionOwner(
        @Param("sessionId") String sessionId,
        @Param("userId") Long userId,
        @Param("guestToken") String guestToken);
}
