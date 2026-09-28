package com.example.ambulancedispatch.controller;

import com.example.ambulancedispatch.dto.AmbulanceRequestDto;
import com.example.ambulancedispatch.dto.AmbulanceResponseDto;
import com.example.ambulancedispatch.dto.StatusUpdateDto;
import com.example.ambulancedispatch.dto.ZoneUpdateDto;
import com.example.ambulancedispatch.service.AmbulanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulances")
@RequiredArgsConstructor
@Tag(name = "Ambulance Management", description = "APIs for registering, updating, and managing ambulances")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    @GetMapping
    @Operation(summary = "Get all ambulances")
    public ResponseEntity<List<AmbulanceResponseDto>> getAllAmbulances() {
        return ResponseEntity.ok(ambulanceService.getAllAmbulances());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ambulance by ID")
    public ResponseEntity<AmbulanceResponseDto> getAmbulanceById(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceById(id));
    }

    @PostMapping
    @Operation(summary = "Register a new ambulance")
    public ResponseEntity<AmbulanceResponseDto> registerAmbulance(@Valid @RequestBody AmbulanceRequestDto dto) {
        AmbulanceResponseDto created = ambulanceService.createAmbulance(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ambulance details")
    public ResponseEntity<AmbulanceResponseDto> updateAmbulance(
            @PathVariable Long id,
            @Valid @RequestBody AmbulanceRequestDto dto) {
        return ResponseEntity.ok(ambulanceService.updateAmbulance(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an ambulance")
    public ResponseEntity<Void> deleteAmbulance(@PathVariable Long id) {
        ambulanceService.deleteAmbulance(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update ambulance status (AVAILABLE / BUSY)")
    public ResponseEntity<AmbulanceResponseDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDto dto) {
        return ResponseEntity.ok(ambulanceService.updateStatus(id, dto));
    }

    @PatchMapping("/{id}/zone")
    @Operation(summary = "Update ambulance current zone")
    public ResponseEntity<AmbulanceResponseDto> updateCurrentZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneUpdateDto dto) {
        return ResponseEntity.ok(ambulanceService.updateCurrentZone(id, dto));
    }
}
