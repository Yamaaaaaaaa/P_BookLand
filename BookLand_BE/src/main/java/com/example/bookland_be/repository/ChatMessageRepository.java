package com.example.bookland_be.repository;

import com.example.bookland_be.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.fromUser.id = :userId1 AND cm.toUser.id = :userId2) OR " +
           "(cm.fromUser.id = :userId2 AND cm.toUser.id = :userId1) " +
           "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findChatHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query(value = "SELECT DISTINCT CASE " +
           "WHEN cm.from_user_id = :adminId THEN cm.to_user_id " +
           "ELSE cm.from_user_id END as user_id " +
           "FROM chat_message cm " +
           "WHERE cm.from_user_id = :adminId OR cm.to_user_id = :adminId", 
           nativeQuery = true)
    List<Long> findConversationUserIds(@Param("adminId") Long adminId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.toUser.id = :userId AND cm.isRead = false")
    Long countUnreadMessages(@Param("userId") Long userId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.fromUser.id = :fromUserId AND cm.toUser.id = :toUserId AND cm.isRead = false")
    Long countUnreadMessagesBetween(@Param("fromUserId") Long fromUserId, @Param("toUserId") Long toUserId);
}
