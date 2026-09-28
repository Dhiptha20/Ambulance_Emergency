package com.example.ambulancedispatch.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneProximityRequestDto {

    @NotNull(message = "From Zone ID is required")
    private Long fromZoneId;

    @NotNull(message = "To Zone ID is required")
    private Long toZoneId;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be greater than 0")
    private Double distance; // in km

    @NotNull(message = "Estimated travel time is required")
    @Positive(message = "Estimated travel time must be greater than 0")
    private Integer estimatedTravelTime; // in minutes
}
