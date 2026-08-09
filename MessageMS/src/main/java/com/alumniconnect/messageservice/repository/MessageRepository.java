package com.alumniconnect.messageservice.repository;

import com.alumniconnect.messageservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.sentAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1") Long user1, @Param("user2") Long user2);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId OR m.senderId = :userId ORDER BY m.sentAt DESC")
    List<Message> findInboxByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(*) FROM user_db.users WHERE id = :userId", nativeQuery = true)
    int countUserById(@Param("userId") Long userId);

    @Query(value = "SELECT email FROM user_db.users WHERE id = :userId", nativeQuery = true)
    Optional<String> findUserEmailById(@Param("userId") Long userId);
}
