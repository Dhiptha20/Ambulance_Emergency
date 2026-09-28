package com.example.ambulancedispatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneResponseDto {
    private Long id;
    private String zoneCode;
    private String zoneName;
    private long ambulanceCount;
}
