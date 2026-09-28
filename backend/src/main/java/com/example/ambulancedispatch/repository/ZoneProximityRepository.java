package com.example.ambulancedispatch.repository;

import com.example.ambulancedispatch.entity.ZoneProximity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneProximityRepository extends JpaRepository<ZoneProximity, Long> {

    @Query("SELECT p FROM ZoneProximity p WHERE " +
           "(p.fromZone.id = :fromZoneId AND p.toZone.id = :toZoneId) OR " +
           "(p.fromZone.id = :toZoneId AND p.toZone.id = :fromZoneId)")
    Optional<ZoneProximity> findProximityBetweenZones(@Param("fromZoneId") Long fromZoneId, 
                                                      @Param("toZoneId") Long toZoneId);

    List<ZoneProximity> findByFromZoneIdOrToZoneId(Long fromZoneId, Long toZoneId);

    boolean existsByFromZoneIdAndToZoneId(Long fromZoneId, Long toZoneId);
}
