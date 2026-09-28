package com.example.ambulancedispatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneProximityResponseDto {
    private Long id;
    private Long fromZoneId;
    private String fromZoneCode;
    private String fromZoneName;
    private Long toZoneId;
    private String toZoneCode;
    private String toZoneName;
    private Double distance;
    private Integer estimatedTravelTime;
}
