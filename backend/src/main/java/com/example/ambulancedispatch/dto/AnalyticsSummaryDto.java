package com.example.ambulancedispatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private long totalAmbulances;
    private long availableAmbulances;
    private long busyAmbulances;
    private long totalEmergencyCalls;
    private long pendingCalls;
    private long inProgressCalls;
    private long completedCalls;
    private long cancelledCalls;
    private Double averageResponseTimeMinutes;
    private Map<String, Long> callsByZone;
    private Map<String, Long> ambulancesByZone;
}
