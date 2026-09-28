package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.AssignmentResultDto;
import com.example.ambulancedispatch.entity.Ambulance;
import com.example.ambulancedispatch.entity.AmbulanceStatus;
import com.example.ambulancedispatch.entity.EmergencyCall;
import com.example.ambulancedispatch.entity.EmergencyStatus;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.entity.ZoneProximity;
import com.example.ambulancedispatch.exception.InvalidAssignmentException;
import com.example.ambulancedispatch.exception.NoAvailableAmbulanceException;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import com.example.ambulancedispatch.repository.EmergencyCallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NearestAmbulanceAllocationService {

    private final AmbulanceRepository ambulanceRepository;
    private final EmergencyCallRepository emergencyCallRepository;
    private final ZoneProximityService proximityService;

    public static class CandidateAmbulance {
        private final Ambulance ambulance;
        private final double distance;
        private final int estimatedTravelTime;

        public CandidateAmbulance(Ambulance ambulance, double distance, int estimatedTravelTime) {
            this.ambulance = ambulance;
            this.distance = distance;
            this.estimatedTravelTime = estimatedTravelTime;
        }

        public Ambulance getAmbulance() {
            return ambulance;
        }

        public double getDistance() {
            return distance;
        }

        public int getEstimatedTravelTime() {
            return estimatedTravelTime;
        }
    }

    /**
     * Finds and assigns the nearest available ambulance to an emergency call.
     */
    @Transactional
    public AssignmentResultDto allocateNearestAmbulance(Long emergencyCallId) {
        EmergencyCall emergencyCall = emergencyCallRepository.findById(emergencyCallId)
                .orElseThrow(() -> new InvalidAssignmentException("Emergency call not found with ID: " + emergencyCallId));

        if (emergencyCall.getStatus() != EmergencyStatus.PENDING) {
            throw new InvalidAssignmentException("Emergency call #" + emergencyCallId + 
                    " cannot be assigned because its current status is " + emergencyCall.getStatus());
        }

        Zone callerZone = emergencyCall.getCallerZone();

        // 1. Find all AVAILABLE ambulances
        List<Ambulance> availableAmbulances = ambulanceRepository.findByStatus(AmbulanceStatus.AVAILABLE);

        if (availableAmbulances.isEmpty()) {
            throw new NoAvailableAmbulanceException("No available ambulance found for the requested zone.");
        }

        // 2. Score each candidate ambulance by proximity to caller zone
        CandidateAmbulance bestCandidate = availableAmbulances.stream()
                .map(ambulance -> {
                    Zone currentZone = ambulance.getCurrentZone();
                    if (currentZone.getId().equals(callerZone.getId())) {
                        // Same zone: 0 km distance, 2 min base travel time
                        return new CandidateAmbulance(ambulance, 0.0, 2);
                    }

                    Optional<ZoneProximity> proximityOpt = proximityService.findProximityBetween(currentZone.getId(), callerZone.getId());
                    if (proximityOpt.isPresent()) {
                        ZoneProximity prox = proximityOpt.get();
                        return new CandidateAmbulance(ambulance, prox.getDistance(), prox.getEstimatedTravelTime());
                    } else {
                        // If direct proximity mapping not defined, assign high penalty
                        return new CandidateAmbulance(ambulance, 999.0, 999);
                    }
                })
                .min(Comparator.comparingDouble(CandidateAmbulance::getDistance)
                        .thenComparingInt(CandidateAmbulance::getEstimatedTravelTime))
                .orElseThrow(() -> new NoAvailableAmbulanceException("No available ambulance found for the requested zone."));

        Ambulance selectedAmbulance = bestCandidate.getAmbulance();

        // Extra safety check: confirm ambulance is still available
        if (selectedAmbulance.getStatus() != AmbulanceStatus.AVAILABLE) {
            throw new InvalidAssignmentException("Ambulance " + selectedAmbulance.getAmbulanceNumber() + " is currently busy and cannot be assigned.");
        }

        // 3. Update Ambulance state: AVAILABLE -> BUSY
        selectedAmbulance.setStatus(AmbulanceStatus.BUSY);
        ambulanceRepository.save(selectedAmbulance);

        // 4. Update EmergencyCall: PENDING -> ASSIGNED
        LocalDateTime dispatchTime = LocalDateTime.now();
        emergencyCall.setAssignedAmbulance(selectedAmbulance);
        emergencyCall.setStatus(EmergencyStatus.ASSIGNED);
        emergencyCall.setDispatchTime(dispatchTime);
        emergencyCallRepository.save(emergencyCall);

        log.info("Successfully assigned ambulance {} (Driver: {}) to emergency call #{} in zone {} (Distance: {} km, Travel time: {} mins)",
                selectedAmbulance.getAmbulanceNumber(),
                selectedAmbulance.getDriverName(),
                emergencyCall.getId(),
                callerZone.getZoneCode(),
                bestCandidate.getDistance(),
                bestCandidate.getEstimatedTravelTime());

        return AssignmentResultDto.builder()
                .emergencyCallId(emergencyCall.getId())
                .ambulanceId(selectedAmbulance.getId())
                .ambulanceNumber(selectedAmbulance.getAmbulanceNumber())
                .driverName(selectedAmbulance.getDriverName())
                .ambulanceZoneCode(selectedAmbulance.getCurrentZone().getZoneCode())
                .ambulanceZoneName(selectedAmbulance.getCurrentZone().getZoneName())
                .callerZoneCode(callerZone.getZoneCode())
                .callerZoneName(callerZone.getZoneName())
                .distanceKm(bestCandidate.getDistance())
                .estimatedTravelTimeMinutes(bestCandidate.getEstimatedTravelTime())
                .dispatchTime(dispatchTime)
                .message(selectedAmbulance.getAmbulanceNumber() + " assigned successfully.")
                .build();
    }
}
