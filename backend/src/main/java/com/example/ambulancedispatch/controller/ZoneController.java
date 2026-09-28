package com.example.ambulancedispatch.controller;

import com.example.ambulancedispatch.dto.ZoneRequestDto;
import com.example.ambulancedispatch.dto.ZoneResponseDto;
import com.example.ambulancedispatch.service.ZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@Tag(name = "Zone Management", description = "APIs for managing service zones")
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    @Operation(summary = "Get all service zones")
    public ResponseEntity<List<ZoneResponseDto>> getAllZones() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zone by ID")
    public ResponseEntity<ZoneResponseDto> getZoneById(@PathVariable Long id) {
        return ResponseEntity.ok(zoneService.getZoneById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new zone")
    public ResponseEntity<ZoneResponseDto> createZone(@Valid @RequestBody ZoneRequestDto dto) {
        ZoneResponseDto created = zoneService.createZone(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update zone details")
    public ResponseEntity<ZoneResponseDto> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneRequestDto dto) {
        return ResponseEntity.ok(zoneService.updateZone(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a zone")
    public ResponseEntity<Void> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }
}
