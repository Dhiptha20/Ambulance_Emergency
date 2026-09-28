package com.example.ambulancedispatch.service;

import com.example.ambulancedispatch.dto.AnalyticsSummaryDto;
import com.example.ambulancedispatch.dto.ZoneResponseTimeAnalyticsDto;
import com.example.ambulancedispatch.entity.Ambulance;
import com.example.ambulancedispatch.entity.AmbulanceStatus;
import com.example.ambulancedispatch.entity.EmergencyCall;
import com.example.ambulancedispatch.entity.EmergencyStatus;
import com.example.ambulancedispatch.entity.Zone;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import com.example.ambulancedispatch.repository.EmergencyCallRepository;
import com.example.ambulancedispatch.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AmbulanceRepository ambulanceRepository;
    private final EmergencyCallRepository emergencyCallRepository;
    private final ZoneRepository zoneRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary() {
        long totalAmbulances = ambulanceRepository.count();
        long availableAmbulances = ambulanceRepository.countByStatus(AmbulanceStatus.AVAILABLE);
        long busyAmbulances = ambulanceRepository.countByStatus(AmbulanceStatus.BUSY);

        long totalCalls = emergencyCallRepository.count();
        long pendingCalls = emergencyCallRepository.countByStatus(EmergencyStatus.PENDING);
        long inProgressCalls = emergencyCallRepository.countByStatus(EmergencyStatus.IN_PROGRESS);
        long completedCalls = emergencyCallRepository.countByStatus(EmergencyStatus.COMPLETED);
        long cancelledCalls = emergencyCallRepository.countByStatus(EmergencyStatus.CANCELLED);

        Double avgResponseTime = emergencyCallRepository.getOverallAverageResponseTime();
        if (avgResponseTime != null) {
            avgResponseTime = Math.round(avgResponseTime * 100.0) / 100.0;
        }

        // Zone-wise breakdown
        List<Zone> allZones = zoneRepository.findAll();
        Map<String, Long> callsByZone = new LinkedHashMap<>();
        Map<String, Long> ambulancesByZone = new LinkedHashMap<>();

        List<EmergencyCall> allCallEntities = emergencyCallRepository.findAll();
        List<Ambulance> allAmbulanceEntities = ambulanceRepository.findAll();

        for (Zone zone : allZones) {
            long cCount = allCallEntities.stream()
                    .filter(c -> c.getCallerZone().getId().equals(zone.getId()))
                    .count();
            callsByZone.put(zone.getZoneCode(), cCount);

            long aCount = allAmbulanceEntities.stream()
                    .filter(a -> a.getCurrentZone().getId().equals(zone.getId()))
                    .count();
            ambulancesByZone.put(zone.getZoneCode(), aCount);
        }

        return AnalyticsSummaryDto.builder()
                .totalAmbulances(totalAmbulances)
                .availableAmbulances(availableAmbulances)
                .busyAmbulances(busyAmbulances)
                .totalEmergencyCalls(totalCalls)
                .pendingCalls(pendingCalls)
                .inProgressCalls(inProgressCalls)
                .completedCalls(completedCalls)
                .cancelledCalls(cancelledCalls)
                .averageResponseTimeMinutes(avgResponseTime != null ? avgResponseTime : 0.0)
                .callsByZone(callsByZone)
                .ambulancesByZone(ambulancesByZone)
                .build();
    }

    @Transactional(readOnly = true)
    public ZoneResponseTimeAnalyticsDto getAverageResponseTime(String zoneCode, LocalDate startDate, LocalDate endDate) {
        Long zoneId = null;
        String resolvedZoneCode = "ALL_ZONES";

        if (zoneCode != null && !zoneCode.trim().isEmpty() && !zoneCode.equalsIgnoreCase("ALL")) {
            Optional<Zone> zoneOpt = zoneRepository.findByZoneCodeIgnoreCase(zoneCode.trim());
            if (zoneOpt.isPresent()) {
                zoneId = zoneOpt.get().getId();
                resolvedZoneCode = zoneOpt.get().getZoneCode();
            }
        }

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now().plusDays(1);

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

        List<EmergencyCall> completedCalls = emergencyCallRepository.findCompletedCallsInDateRange(
                zoneId, EmergencyStatus.COMPLETED, startDateTime, endDateTime);

        long count = completedCalls.size();
        Double avg = 0.0;
        Long min = 0L;
        Long max = 0L;

        if (count > 0) {
            List<Long> responseTimes = completedCalls.stream()
                    .map(c -> c.getResponseTimeMinutes() != null ? c.getResponseTimeMinutes() : 0L)
                    .sorted()
                    .toList();

            double sum = responseTimes.stream().mapToDouble(Long::doubleValue).sum();
            avg = Math.round((sum / count) * 100.0) / 100.0;
            min = responseTimes.get(0);
            max = responseTimes.get(responseTimes.size() - 1);
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<ZoneResponseTimeAnalyticsDto.CompletedCallDetailDto> callDetails = completedCalls.stream()
                .map(c -> ZoneResponseTimeAnalyticsDto.CompletedCallDetailDto.builder()
                        .callId(c.getId())
                        .callerName(c.getCallerName())
                        .callerZone(c.getCallerZone().getZoneCode())
                        .assignedAmbulanceNumber(c.getAssignedAmbulance() != null ? c.getAssignedAmbulance().getAmbulanceNumber() : "N/A")
                        .responseTimeMinutes(c.getResponseTimeMinutes())
                        .completedAt(c.getCompletionTime() != null ? c.getCompletionTime().format(dtf) : "N/A")
                        .build())
                .collect(Collectors.toList());

        return ZoneResponseTimeAnalyticsDto.builder()
                .zone(resolvedZoneCode)
                .startDate(start)
                .endDate(end)
                .numberOfCompletedCalls(count)
                .averageResponseTime(avg)
                .minimumResponseTime(min)
                .maximumResponseTime(max)
                .completedCalls(callDetails)
                .build();
    }
}
