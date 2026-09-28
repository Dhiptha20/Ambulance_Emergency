package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.AssignmentResultDto;
import com.example.ambulancedispatch.dto.EmergencyCallRequestDto;
import com.example.ambulancedispatch.dto.EmergencyCallResponseDto;
import com.example.ambulancedispatch.entity.Ambulance;
import com.example.ambulancedispatch.entity.AmbulanceStatus;
import com.example.ambulancedispatch.entity.EmergencyCall;
import com.example.ambulancedispatch.entity.EmergencyStatus;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.exception.InvalidAssignmentException;
import com.example.ambulancedispatch.exception.ResourceNotFoundException;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import com.example.ambulancedispatch.repository.EmergencyCallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyCallService {

    private final EmergencyCallRepository emergencyCallRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final ZoneService zoneService;
    private final NearestAmbulanceAllocationService allocationService;

    @Transactional(readOnly = true)
    public List<EmergencyCallResponseDto> getAllCalls() {
        return emergencyCallRepository.findAll().stream()
                .sorted((a, b) -> b.getCallTime().compareTo(a.getCallTime()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmergencyCallResponseDto getCallById(Long id) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));
        return mapToDto(call);
    }

    @Transactional
    public EmergencyCallResponseDto createCall(EmergencyCallRequestDto dto) {
        Zone callerZone = zoneService.getZoneEntityById(dto.getCallerZoneId());

        EmergencyCall call = EmergencyCall.builder()
                .callerName(dto.getCallerName().trim())
                .callerPhone(dto.getCallerPhone().trim())
                .emergencyDescription(dto.getEmergencyDescription().trim())
                .callerZone(callerZone)
                .callTime(LocalDateTime.now())
                .status(EmergencyStatus.PENDING)
                .build();

        EmergencyCall saved = emergencyCallRepository.save(call);

        if (Boolean.TRUE.equals(dto.getAutoAssign())) {
            try {
                allocationService.allocateNearestAmbulance(saved.getId());
                // Refresh entity from db
                saved = emergencyCallRepository.findById(saved.getId()).orElse(saved);
            } catch (Exception e) {
                log.warn("Auto-assignment for call #{} could not be completed: {}", saved.getId(), e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    @Transactional
    public EmergencyCallResponseDto updateCall(Long id, EmergencyCallRequestDto dto) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));

        Zone callerZone = zoneService.getZoneEntityById(dto.getCallerZoneId());
        call.setCallerName(dto.getCallerName().trim());
        call.setCallerPhone(dto.getCallerPhone().trim());
        call.setEmergencyDescription(dto.getEmergencyDescription().trim());
        call.setCallerZone(callerZone);

        EmergencyCall updated = emergencyCallRepository.save(call);
        return mapToDto(updated);
    }

    @Transactional
    public AssignmentResultDto assignAmbulance(Long id) {
        return allocationService.allocateNearestAmbulance(id);
    }

    @Transactional
    public EmergencyCallResponseDto startEmergency(Long id) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));

        if (call.getStatus() != EmergencyStatus.ASSIGNED) {
            throw new InvalidAssignmentException("Cannot start emergency call #" + id + " because it is in " + call.getStatus() + " state (must be ASSIGNED).");
        }

        call.setStatus(EmergencyStatus.IN_PROGRESS);
        call.setArrivalTime(LocalDateTime.now());

        EmergencyCall updated = emergencyCallRepository.save(call);
        return mapToDto(updated);
    }

    @Transactional
    public EmergencyCallResponseDto completeEmergency(Long id) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));

        if (call.getStatus() != EmergencyStatus.IN_PROGRESS && call.getStatus() != EmergencyStatus.ASSIGNED) {
            throw new InvalidAssignmentException("Cannot complete emergency call #" + id + " with status " + call.getStatus());
        }

        LocalDateTime completionTime = LocalDateTime.now();
        call.setCompletionTime(completionTime);
        call.setStatus(EmergencyStatus.COMPLETED);

        // Calculate response time in minutes from dispatchTime (or callTime) to completionTime
        LocalDateTime startTime = call.getDispatchTime() != null ? call.getDispatchTime() : call.getCallTime();
        long minutes = Duration.between(startTime, completionTime).toMinutes();
        if (minutes < 1) {
            minutes = 1; // minimum 1 min for realism
        }
        call.setResponseTimeMinutes(minutes);

        // Free assigned ambulance: BUSY -> AVAILABLE and update current zone to caller zone
        Ambulance ambulance = call.getAssignedAmbulance();
        if (ambulance != null) {
            ambulance.setStatus(AmbulanceStatus.AVAILABLE);
            // After finishing call, ambulance is at the scene (caller zone)
            ambulance.setCurrentZone(call.getCallerZone());
            ambulanceRepository.save(ambulance);
        }

        EmergencyCall updated = emergencyCallRepository.save(call);
        return mapToDto(updated);
    }

    @Transactional
    public EmergencyCallResponseDto cancelEmergency(Long id) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));

        if (call.getStatus() == EmergencyStatus.COMPLETED) {
            throw new InvalidAssignmentException("Cannot cancel an already completed emergency call.");
        }

        call.setStatus(EmergencyStatus.CANCELLED);

        // If an ambulance was assigned, free it back to AVAILABLE
        Ambulance ambulance = call.getAssignedAmbulance();
        if (ambulance != null && ambulance.getStatus() == AmbulanceStatus.BUSY) {
            ambulance.setStatus(AmbulanceStatus.AVAILABLE);
            ambulanceRepository.save(ambulance);
        }

        EmergencyCall updated = emergencyCallRepository.save(call);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCall(Long id) {
        EmergencyCall call = emergencyCallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency call not found with ID: " + id));
        
        // If assigned and busy, release ambulance
        if (call.getAssignedAmbulance() != null && call.getStatus() != EmergencyStatus.COMPLETED) {
            Ambulance amb = call.getAssignedAmbulance();
            if (amb.getStatus() == AmbulanceStatus.BUSY) {
                amb.setStatus(AmbulanceStatus.AVAILABLE);
                ambulanceRepository.save(amb);
            }
        }
        emergencyCallRepository.delete(call);
    }

    public EmergencyCallResponseDto mapToDto(EmergencyCall call) {
        return EmergencyCallResponseDto.builder()
                .id(call.getId())
                .callerName(call.getCallerName())
                .callerPhone(call.getCallerPhone())
                .emergencyDescription(call.getEmergencyDescription())
                .callerZoneId(call.getCallerZone().getId())
                .callerZoneCode(call.getCallerZone().getZoneCode())
                .callerZoneName(call.getCallerZone().getZoneName())
                .assignedAmbulanceId(call.getAssignedAmbulance() != null ? call.getAssignedAmbulance().getId() : null)
                .assignedAmbulanceNumber(call.getAssignedAmbulance() != null ? call.getAssignedAmbulance().getAmbulanceNumber() : null)
                .assignedAmbulanceDriver(call.getAssignedAmbulance() != null ? call.getAssignedAmbulance().getDriverName() : null)
                .assignedAmbulanceCurrentZoneCode(call.getAssignedAmbulance() != null ? call.getAssignedAmbulance().getCurrentZone().getZoneCode() : null)
                .callTime(call.getCallTime())
                .dispatchTime(call.getDispatchTime())
                .arrivalTime(call.getArrivalTime())
                .completionTime(call.getCompletionTime())
                .responseTimeMinutes(call.getResponseTimeMinutes())
                .status(call.getStatus())
                .build();
    }
}
