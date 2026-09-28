package com.example.ambulancedispatch.controller;

import com.example.ambulancedispatch.dto.ZoneProximityRequestDto;
import com.example.ambulancedispatch.dto.ZoneProximityResponseDto;
import com.example.ambulancedispatch.service.ZoneProximityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proximity")
@RequiredArgsConstructor
@Tag(name = "Zone Proximity Management", description = "APIs for configuring distance and travel times between zones")
public class ZoneProximityController {

    private final ZoneProximityService proximityService;

    @GetMapping
    @Operation(summary = "Get all zone proximity mappings")
    public ResponseEntity<List<ZoneProximityResponseDto>> getAllProximities() {
        return ResponseEntity.ok(proximityService.getAllProximities());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zone proximity mapping by ID")
    public ResponseEntity<ZoneProximityResponseDto> getProximityById(@PathVariable Long id) {
        return ResponseEntity.ok(proximityService.getProximityById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new zone proximity mapping")
    public ResponseEntity<ZoneProximityResponseDto> createProximity(@Valid @RequestBody ZoneProximityRequestDto dto) {
        ZoneProximityResponseDto created = proximityService.createProximity(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing zone proximity mapping")
    public ResponseEntity<ZoneProximityResponseDto> updateProximity(
            @PathVariable Long id,
            @Valid @RequestBody ZoneProximityRequestDto dto) {
        return ResponseEntity.ok(proximityService.updateProximity(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a zone proximity mapping")
    public ResponseEntity<Void> deleteProximity(@PathVariable Long id) {
        proximityService.deleteProximity(id);
        return ResponseEntity.noContent().build();
    }
}
