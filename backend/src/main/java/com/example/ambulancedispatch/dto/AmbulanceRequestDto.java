package com.example.ambulancedispatch.dto;

import com.example.ambulancedispatch.entity.AmbulanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceRequestDto {

    @NotBlank(message = "Ambulance number cannot be empty")
    @Size(min = 2, max = 50, message = "Ambulance number must be between 2 and 50 characters")
    private String ambulanceNumber;

    @NotBlank(message = "Driver name cannot be empty")
    @Size(min = 2, max = 100, message = "Driver name must be between 2 and 100 characters")
    private String driverName;

    @NotNull(message = "Home zone ID is required")
    private Long homeZoneId;

    private Long currentZoneId; // Optional on create, defaults to homeZoneId

    private AmbulanceStatus status; // Optional on create, defaults to AVAILABLE

    private LocalDate registrationDate; // Optional on create, defaults to now
}
