package com.nixtap.analyticsservice.repository;

import com.nixtap.analyticsservice.entity.AnalyticsEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, Long> {

    /** All events for an owner, newest first — paginated. */
    Page<AnalyticsEvent> findByOwnerIdOrderByCreatedAtDesc(String ownerId, Pageable pageable);

    /** Non-paginated variant used only for the dashboard 10-event preview. */
    List<AnalyticsEvent> findTop10ByOwnerIdOrderByCreatedAtDesc(String ownerId);

    /** Total event count for an owner. */
    long countByOwnerId(String ownerId);

    /** Count filtered by target type (CARD, PORTFOLIO, QR). */
    long countByOwnerIdAndTargetType(String ownerId, String targetType);

    /** Count filtered by event type (VIEW, SCAN, TAP). */
    long countByOwnerIdAndEventType(String ownerId, String eventType);

    /**
     * Returns device-type aggregation counts for an owner.
     * Each element of the result list is an Object[2]: [deviceType (String), count (Long)].
     */
    @Query("SELECT e.deviceType, COUNT(e) FROM AnalyticsEvent e " +
           "WHERE e.ownerId = :ownerId GROUP BY e.deviceType")
    List<Object[]> countGroupedByDeviceType(@Param("ownerId") String ownerId);

    /**
     * Returns browser aggregation counts for an owner.
     * Each element of the result list is an Object[2]: [browser (String), count (Long)].
     */
    @Query("SELECT e.browser, COUNT(e) FROM AnalyticsEvent e " +
           "WHERE e.ownerId = :ownerId GROUP BY e.browser")
    List<Object[]> countGroupedByBrowser(@Param("ownerId") String ownerId);
}
