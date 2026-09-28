package com.example.ambulancedispatch.dto;

import com.example.ambulancedispatch.entity.EmergencyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyCallResponseDto {
    private Long id;
    private String callerName;
    private String callerPhone;
    private String emergencyDescription;
    private Long callerZoneId;
    private String callerZoneCode;
    private String callerZoneName;
    private Long assignedAmbulanceId;
    private String assignedAmbulanceNumber;
    private String assignedAmbulanceDriver;
    private String assignedAmbulanceCurrentZoneCode;
    private LocalDateTime callTime;
    private LocalDateTime dispatchTime;
    private LocalDateTime arrivalTime;
    private LocalDateTime completionTime;
    private Long responseTimeMinutes;
    private EmergencyStatus status;
}
