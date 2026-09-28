package com.example.ambulancedispatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneResponseTimeAnalyticsDto {
    private String zone;
    private LocalDate startDate;
    private LocalDate endDate;
    private long numberOfCompletedCalls;
    private Double averageResponseTime; // in minutes
    private Long minimumResponseTime; // in minutes
    private Long maximumResponseTime; // in minutes
    private List<CompletedCallDetailDto> completedCalls;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletedCallDetailDto {
        private Long callId;
        private String callerName;
        private String callerZone;
        private String assignedAmbulanceNumber;
        private Long responseTimeMinutes;
        private String completedAt;
    }
}
