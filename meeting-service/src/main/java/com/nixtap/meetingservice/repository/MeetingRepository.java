package com.nixtap.meetingservice.repository;

import com.nixtap.meetingservice.entity.MeetingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<MeetingRequest, Long> {
    List<MeetingRequest> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<MeetingRequest> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, String status);
    long countByOwnerIdAndStatus(Long ownerId, String status);
    long countByOwnerId(Long ownerId);
    java.util.Optional<MeetingRequest> findByCancelToken(String cancelToken);
}
