package com.example.ambulancedispatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneRequestDto {

    @NotBlank(message = "Zone code cannot be empty")
    @Size(min = 2, max = 50, message = "Zone code must be between 2 and 50 characters")
    private String zoneCode;

    @NotBlank(message = "Zone name cannot be empty")
    @Size(min = 2, max = 100, message = "Zone name must be between 2 and 100 characters")
    private String zoneName;
}
