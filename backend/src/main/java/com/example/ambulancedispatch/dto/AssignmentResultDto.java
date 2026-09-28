package com.example.ambulancedispatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResultDto {
    private Long emergencyCallId;
    private Long ambulanceId;
    private String ambulanceNumber;
    private String driverName;
    private String ambulanceZoneCode;
    private String ambulanceZoneName;
    private String callerZoneCode;
    private String callerZoneName;
    private Double distanceKm;
    private Integer estimatedTravelTimeMinutes;
    private LocalDateTime dispatchTime;
    private String message;
}
