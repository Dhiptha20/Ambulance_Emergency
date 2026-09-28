package com.example.ambulancedispatch.dto;

import com.example.ambulancedispatch.entity.AmbulanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateDto {
    @NotNull(message = "Status cannot be null")
    private AmbulanceStatus status;
}
