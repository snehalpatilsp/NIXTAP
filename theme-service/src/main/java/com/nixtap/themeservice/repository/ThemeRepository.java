package com.nixtap.themeservice.repository;

import com.nixtap.themeservice.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
    List<Theme> findByIsActiveTrueOrderByNameAsc();
    Optional<Theme> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByName(String name);
}
