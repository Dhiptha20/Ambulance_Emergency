package com.example.ambulancedispatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneUpdateDto {
    @NotNull(message = "Zone ID cannot be null")
    private Long zoneId;
}
