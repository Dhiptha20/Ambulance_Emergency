package com.example.ambulancedispatch.controller;

import com.example.ambulancedispatch.dto.AssignmentResultDto;
import com.example.ambulancedispatch.dto.EmergencyCallRequestDto;
import com.example.ambulancedispatch.dto.EmergencyCallResponseDto;
import com.example.ambulancedispatch.service.EmergencyCallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency-calls")
@RequiredArgsConstructor
@Tag(name = "Emergency Call Management", description = "APIs for logging, assigning nearest ambulance, and processing emergency calls")
public class EmergencyCallController {

    private final EmergencyCallService emergencyCallService;

    @GetMapping
    @Operation(summary = "Get all emergency calls")
    public ResponseEntity<List<EmergencyCallResponseDto>> getAllCalls() {
        return ResponseEntity.ok(emergencyCallService.getAllCalls());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get emergency call by ID")
    public ResponseEntity<EmergencyCallResponseDto> getCallById(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyCallService.getCallById(id));
    }

    @PostMapping
    @Operation(summary = "Register a new emergency call")
    public ResponseEntity<EmergencyCallResponseDto> createCall(@Valid @RequestBody EmergencyCallRequestDto dto) {
        EmergencyCallResponseDto created = emergencyCallService.createCall(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update emergency call information")
    public ResponseEntity<EmergencyCallResponseDto> updateCall(
            @PathVariable Long id,
            @Valid @RequestBody EmergencyCallRequestDto dto) {
        return ResponseEntity.ok(emergencyCallService.updateCall(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an emergency call")
    public ResponseEntity<Void> deleteCall(@PathVariable Long id) {
        emergencyCallService.deleteCall(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Automatically allocate and assign the nearest available ambulance")
    public ResponseEntity<AssignmentResultDto> assignNearestAmbulance(@PathVariable Long id) {
        AssignmentResultDto result = emergencyCallService.assignAmbulance(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Mark emergency call as IN_PROGRESS (Ambulance arrived at scene)")
    public ResponseEntity<EmergencyCallResponseDto> startEmergency(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyCallService.startEmergency(id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete emergency call and release assigned ambulance back to AVAILABLE")
    public ResponseEntity<EmergencyCallResponseDto> completeEmergency(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyCallService.completeEmergency(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel emergency call and release assigned ambulance if any")
    public ResponseEntity<EmergencyCallResponseDto> cancelEmergency(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyCallService.cancelEmergency(id));
    }
}
