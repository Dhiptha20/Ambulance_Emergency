package com.example.ambulancedispatch.repository;

import com.example.ambulancedispatch.entity.EmergencyCall;
import com.example.ambulancedispatch.entity.EmergencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmergencyCallRepository extends JpaRepository<EmergencyCall, Long> {

    List<EmergencyCall> findByStatus(EmergencyStatus status);

    List<EmergencyCall> findByCallerZoneId(Long zoneId);

    long countByStatus(EmergencyStatus status);

    @Query("SELECT e FROM EmergencyCall e WHERE " +
           "(:zoneId IS NULL OR e.callerZone.id = :zoneId) AND " +
           "e.status = :status AND " +
           "e.callTime >= :startDateTime AND e.callTime <= :endDateTime")
    List<EmergencyCall> findCompletedCallsInDateRange(
            @Param("zoneId") Long zoneId,
            @Param("status") EmergencyStatus status,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT AVG(e.responseTimeMinutes) FROM EmergencyCall e WHERE e.status = 'COMPLETED'")
    Double getOverallAverageResponseTime();
}
