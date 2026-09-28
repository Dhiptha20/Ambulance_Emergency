package com.example.ambulancedispatch.controller;

import com.example.ambulancedispatch.dto.AnalyticsSummaryDto;
import com.example.ambulancedispatch.dto.ZoneResponseTimeAnalyticsDto;
import com.example.ambulancedispatch.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "APIs for response time metrics, fleet utilization, and emergency statistics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get overall dispatch and fleet analytics summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/average-response-time")
    @Operation(summary = "Get average, min, max response times per zone over a date range")
    public ResponseEntity<ZoneResponseTimeAnalyticsDto> getAverageResponseTime(
            @Parameter(description = "Zone code (e.g. ZONE-A) or 'ALL'")
            @RequestParam(required = false) String zone,
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getAverageResponseTime(zone, startDate, endDate));
    }
}
