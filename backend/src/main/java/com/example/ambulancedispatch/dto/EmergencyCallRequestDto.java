package com.example.ambulancedispatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyCallRequestDto {

    @NotBlank(message = "Caller name cannot be empty")
    @Size(min = 2, max = 100, message = "Caller name must be between 2 and 100 characters")
    private String callerName;

    @NotBlank(message = "Caller phone number cannot be empty")
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Please enter a valid phone number (7-20 digits/symbols)")
    private String callerPhone;

    @NotBlank(message = "Emergency description cannot be empty")
    @Size(min = 3, max = 500, message = "Emergency description must be between 3 and 500 characters")
    private String emergencyDescription;

    @NotNull(message = "Caller zone ID is required")
    private Long callerZoneId;

    private Boolean autoAssign; // Optional helper parameter: if true, immediately assign nearest ambulance after creation
}
