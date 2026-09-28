package com.example.ambulancedispatch.dto;

import com.example.ambulancedispatch.entity.AmbulanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceResponseDto {
    private Long id;
    private String ambulanceNumber;
    private String driverName;
    private Long homeZoneId;
    private String homeZoneCode;
    private String homeZoneName;
    private Long currentZoneId;
    private String currentZoneCode;
    private String currentZoneName;
    private AmbulanceStatus status;
    private LocalDate registrationDate;
}
