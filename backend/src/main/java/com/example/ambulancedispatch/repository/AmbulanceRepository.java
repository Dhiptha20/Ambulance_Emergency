package com.example.ambulancedispatch.repository;

import com.example.ambulancedispatch.entity.Ambulance;
import com.example.ambulancedispatch.entity.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    Optional<Ambulance> findByAmbulanceNumberIgnoreCase(String ambulanceNumber);
    boolean existsByAmbulanceNumberIgnoreCase(String ambulanceNumber);
    List<Ambulance> findByStatus(AmbulanceStatus status);
    List<Ambulance> findByCurrentZoneId(Long zoneId);
    List<Ambulance> findByHomeZoneId(Long zoneId);
    long countByStatus(AmbulanceStatus status);
    long countByCurrentZoneId(Long zoneId);
}
