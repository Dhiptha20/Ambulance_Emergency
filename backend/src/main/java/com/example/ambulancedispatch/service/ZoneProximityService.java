package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.ZoneProximityRequestDto;
import com.example.ambulancedispatch.dto.ZoneProximityResponseDto;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.entity.ZoneProximity;
import com.example.ambulancedispatch.exception.DuplicateResourceException;
import com.example.ambulancedispatch.exception.ResourceNotFoundException;
import com.example.ambulancedispatch.repository.ZoneProximityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneProximityService {

    private final ZoneProximityRepository proximityRepository;
    private final ZoneService zoneService;

    @Transactional(readOnly = true)
    public List<ZoneProximityResponseDto> getAllProximities() {
        return proximityRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ZoneProximityResponseDto getProximityById(Long id) {
        ZoneProximity proximity = proximityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone proximity not found with ID: " + id));
        return mapToDto(proximity);
    }

    @Transactional(readOnly = true)
    public Optional<ZoneProximity> findProximityBetween(Long fromZoneId, Long toZoneId) {
        if (fromZoneId.equals(toZoneId)) {
            // Same zone: 0 distance and 2 min local travel time
            Zone zone = zoneService.getZoneEntityById(fromZoneId);
            ZoneProximity selfProximity = ZoneProximity.builder()
                    .fromZone(zone)
                    .toZone(zone)
                    .distance(0.0)
                    .estimatedTravelTime(2)
                    .build();
            return Optional.of(selfProximity);
        }
        return proximityRepository.findProximityBetweenZones(fromZoneId, toZoneId);
    }

    @Transactional
    public ZoneProximityResponseDto createProximity(ZoneProximityRequestDto dto) {
        if (dto.getFromZoneId().equals(dto.getToZoneId())) {
            throw new IllegalArgumentException("From Zone and To Zone cannot be the same zone");
        }

        Zone fromZone = zoneService.getZoneEntityById(dto.getFromZoneId());
        Zone toZone = zoneService.getZoneEntityById(dto.getToZoneId());

        if (proximityRepository.existsByFromZoneIdAndToZoneId(fromZone.getId(), toZone.getId())) {
            throw new DuplicateResourceException("Proximity mapping already exists between " + fromZone.getZoneCode() + " and " + toZone.getZoneCode());
        }

        ZoneProximity proximity = ZoneProximity.builder()
                .fromZone(fromZone)
                .toZone(toZone)
                .distance(dto.getDistance())
                .estimatedTravelTime(dto.getEstimatedTravelTime())
                .build();

        ZoneProximity saved = proximityRepository.save(proximity);
        return mapToDto(saved);
    }

    @Transactional
    public ZoneProximityResponseDto updateProximity(Long id, ZoneProximityRequestDto dto) {
        ZoneProximity proximity = proximityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone proximity not found with ID: " + id));

        if (dto.getFromZoneId().equals(dto.getToZoneId())) {
            throw new IllegalArgumentException("From Zone and To Zone cannot be the same zone");
        }

        Zone fromZone = zoneService.getZoneEntityById(dto.getFromZoneId());
        Zone toZone = zoneService.getZoneEntityById(dto.getToZoneId());

        proximity.setFromZone(fromZone);
        proximity.setToZone(toZone);
        proximity.setDistance(dto.getDistance());
        proximity.setEstimatedTravelTime(dto.getEstimatedTravelTime());

        ZoneProximity updated = proximityRepository.save(proximity);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteProximity(Long id) {
        ZoneProximity proximity = proximityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone proximity not found with ID: " + id));
        proximityRepository.delete(proximity);
    }

    public ZoneProximityResponseDto mapToDto(ZoneProximity proximity) {
        return ZoneProximityResponseDto.builder()
                .id(proximity.getId())
                .fromZoneId(proximity.getFromZone().getId())
                .fromZoneCode(proximity.getFromZone().getZoneCode())
                .fromZoneName(proximity.getFromZone().getZoneName())
                .toZoneId(proximity.getToZone().getId())
                .toZoneCode(proximity.getToZone().getZoneCode())
                .toZoneName(proximity.getToZone().getZoneName())
                .distance(proximity.getDistance())
                .estimatedTravelTime(proximity.getEstimatedTravelTime())
                .build();
    }
}
