package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.ZoneRequestDto;
import com.example.ambulancedispatch.dto.ZoneResponseDto;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.exception.DuplicateResourceException;
import com.example.ambulancedispatch.exception.ResourceNotFoundException;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import com.example.ambulancedispatch.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final AmbulanceRepository ambulanceRepository;

    @Transactional(readOnly = true)
    public List<ZoneResponseDto> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ZoneResponseDto getZoneById(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));
        return mapToDto(zone);
    }

    @Transactional(readOnly = true)
    public Zone getZoneEntityById(Long id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Zone getZoneEntityByCode(String zoneCode) {
        return zoneRepository.findByZoneCodeIgnoreCase(zoneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with code: " + zoneCode));
    }

    @Transactional
    public ZoneResponseDto createZone(ZoneRequestDto dto) {
        if (zoneRepository.existsByZoneCodeIgnoreCase(dto.getZoneCode().trim())) {
            throw new DuplicateResourceException("Zone with code '" + dto.getZoneCode() + "' already exists");
        }

        Zone zone = Zone.builder()
                .zoneCode(dto.getZoneCode().trim().toUpperCase())
                .zoneName(dto.getZoneName().trim())
                .build();

        Zone saved = zoneRepository.save(zone);
        return mapToDto(saved);
    }

    @Transactional
    public ZoneResponseDto updateZone(Long id, ZoneRequestDto dto) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));

        String newCode = dto.getZoneCode().trim().toUpperCase();
        if (!zone.getZoneCode().equalsIgnoreCase(newCode) && zoneRepository.existsByZoneCodeIgnoreCase(newCode)) {
            throw new DuplicateResourceException("Zone with code '" + newCode + "' already exists");
        }

        zone.setZoneCode(newCode);
        zone.setZoneName(dto.getZoneName().trim());

        Zone updated = zoneRepository.save(zone);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteZone(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with ID: " + id));
        
        long count = ambulanceRepository.countByCurrentZoneId(id);
        if (count > 0) {
            throw new IllegalStateException("Cannot delete zone '" + zone.getZoneCode() + "' because " + count + " ambulance(s) are currently stationed in it.");
        }

        zoneRepository.delete(zone);
    }

    public ZoneResponseDto mapToDto(Zone zone) {
        long ambulanceCount = ambulanceRepository.countByCurrentZoneId(zone.getId());
        return ZoneResponseDto.builder()
                .id(zone.getId())
                .zoneCode(zone.getZoneCode())
                .zoneName(zone.getZoneName())
                .ambulanceCount(ambulanceCount)
                .build();
    }
}
