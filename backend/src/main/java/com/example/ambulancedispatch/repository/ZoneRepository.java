package com.example.ambulancedispatch.repository;

import com.example.ambulancedispatch.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    Optional<Zone> findByZoneCodeIgnoreCase(String zoneCode);
    boolean existsByZoneCodeIgnoreCase(String zoneCode);
}
