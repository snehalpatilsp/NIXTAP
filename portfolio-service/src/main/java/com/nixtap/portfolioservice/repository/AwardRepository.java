package com.nixtap.portfolioservice.repository;

import com.nixtap.portfolioservice.entity.Award;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwardRepository extends JpaRepository<Award, Long> {
    List<Award> findByUserIdOrderByIssueDateDesc(Long userId);
}