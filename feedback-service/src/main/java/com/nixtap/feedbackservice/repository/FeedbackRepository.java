package com.nixtap.feedbackservice.repository;

import com.nixtap.feedbackservice.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByCardIdAndIsApprovedTrueOrderByCreatedAtDesc(Long cardId);

    List<Feedback> findByCardIdOrderByCreatedAtDesc(Long cardId);

    List<Feedback> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Feedback> findByCardIdAndIsApprovedFalseOrderByCreatedAtDesc(Long cardId);

    long countByCardId(Long cardId);

    long countByCardIdAndIsApprovedTrue(Long cardId);

    long countByOwnerIdAndIsApprovedFalse(Long ownerId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.cardId = :cardId AND f.isApproved = true")
    Double averageRatingByCardId(@Param("cardId") Long cardId);
}
