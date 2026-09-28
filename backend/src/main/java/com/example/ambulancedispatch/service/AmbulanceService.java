package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.AmbulanceRequestDto;
import com.example.ambulancedispatch.dto.AmbulanceResponseDto;
import com.example.ambulancedispatch.dto.StatusUpdateDto;
import com.example.ambulancedispatch.dto.ZoneUpdateDto;
import com.example.ambulancedispatch.entity.Ambulance;
import com.example.ambulancedispatch.entity.AmbulanceStatus;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.exception.DuplicateResourceException;
import com.example.ambulancedispatch.exception.ResourceNotFoundException;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final ZoneService zoneService;

    @Transactional(readOnly = true)
    public List<AmbulanceResponseDto> getAllAmbulances() {
        return ambulanceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AmbulanceResponseDto getAmbulanceById(Long id) {
        Ambulance ambulance = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));
        return mapToDto(ambulance);
    }

    @Transactional(readOnly = true)
    public Ambulance getAmbulanceEntityById(Long id) {
        return ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Ambulance> getAvailableAmbulances() {
        return ambulanceRepository.findByStatus(AmbulanceStatus.AVAILABLE);
    }

    @Transactional
    public AmbulanceResponseDto createAmbulance(AmbulanceRequestDto dto) {
        String num = dto.getAmbulanceNumber().trim().toUpperCase();
        if (ambulanceRepository.existsByAmbulanceNumberIgnoreCase(num)) {
            throw new DuplicateResourceException("Ambulance with number '" + num + "' already exists");
        }

        Zone homeZone = zoneService.getZoneEntityById(dto.getHomeZoneId());
        Zone currentZone = dto.getCurrentZoneId() != null
                ? zoneService.getZoneEntityById(dto.getCurrentZoneId())
                : homeZone;

        Ambulance ambulance = Ambulance.builder()
                .ambulanceNumber(num)
                .driverName(dto.getDriverName().trim())
                .homeZone(homeZone)
                .currentZone(currentZone)
                .status(dto.getStatus() != null ? dto.getStatus() : AmbulanceStatus.AVAILABLE)
                .registrationDate(dto.getRegistrationDate() != null ? dto.getRegistrationDate() : LocalDate.now())
                .build();

        Ambulance saved = ambulanceRepository.save(ambulance);
        return mapToDto(saved);
    }

    @Transactional
    public AmbulanceResponseDto updateAmbulance(Long id, AmbulanceRequestDto dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));

        String num = dto.getAmbulanceNumber().trim().toUpperCase();
        if (!ambulance.getAmbulanceNumber().equalsIgnoreCase(num) && ambulanceRepository.existsByAmbulanceNumberIgnoreCase(num)) {
            throw new DuplicateResourceException("Ambulance with number '" + num + "' already exists");
        }

        Zone homeZone = zoneService.getZoneEntityById(dto.getHomeZoneId());
        Zone currentZone = dto.getCurrentZoneId() != null
                ? zoneService.getZoneEntityById(dto.getCurrentZoneId())
                : homeZone;

        ambulance.setAmbulanceNumber(num);
        ambulance.setDriverName(dto.getDriverName().trim());
        ambulance.setHomeZone(homeZone);
        ambulance.setCurrentZone(currentZone);
        if (dto.getStatus() != null) {
            ambulance.setStatus(dto.getStatus());
        }
        if (dto.getRegistrationDate() != null) {
            ambulance.setRegistrationDate(dto.getRegistrationDate());
        }

        Ambulance updated = ambulanceRepository.save(ambulance);
        return mapToDto(updated);
    }

    @Transactional
    public AmbulanceResponseDto updateStatus(Long id, StatusUpdateDto dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));
        ambulance.setStatus(dto.getStatus());
        Ambulance updated = ambulanceRepository.save(ambulance);
        return mapToDto(updated);
    }

    @Transactional
    public AmbulanceResponseDto updateCurrentZone(Long id, ZoneUpdateDto dto) {
        Ambulance ambulance = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));
        Zone newZone = zoneService.getZoneEntityById(dto.getZoneId());
        ambulance.setCurrentZone(newZone);
        Ambulance updated = ambulanceRepository.save(ambulance);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteAmbulance(Long id) {
        Ambulance ambulance = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance not found with ID: " + id));
        if (ambulance.getStatus() == AmbulanceStatus.BUSY) {
            throw new IllegalStateException("Cannot delete an ambulance that is currently BUSY on active dispatch.");
        }
        ambulanceRepository.delete(ambulance);
    }

    public AmbulanceResponseDto mapToDto(Ambulance ambulance) {
        return AmbulanceResponseDto.builder()
                .id(ambulance.getId())
                .ambulanceNumber(ambulance.getAmbulanceNumber())
                .driverName(ambulance.getDriverName())
                .homeZoneId(ambulance.getHomeZone().getId())
                .homeZoneCode(ambulance.getHomeZone().getZoneCode())
                .homeZoneName(ambulance.getHomeZone().getZoneName())
                .currentZoneId(ambulance.getCurrentZone().getId())
                .currentZoneCode(ambulance.getCurrentZone().getZoneCode())
                .currentZoneName(ambulance.getCurrentZone().getZoneName())
                .status(ambulance.getStatus())
                .registrationDate(ambulance.getRegistrationDate())
                .build();
    }
}
