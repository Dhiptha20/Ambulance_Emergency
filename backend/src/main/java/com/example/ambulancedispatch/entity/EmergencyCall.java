package com.example.ambulancedispatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_calls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String callerName;

    @Column(nullable = false, length = 20)
    private String callerPhone;

    @Column(nullable = false, length = 500)
    private String emergencyDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "caller_zone_id", nullable = false)
    private Zone callerZone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_ambulance_id")
    private Ambulance assignedAmbulance;

    @Column(nullable = false)
    private LocalDateTime callTime;

    private LocalDateTime dispatchTime;

    private LocalDateTime arrivalTime;

    private LocalDateTime completionTime;

    private Long responseTimeMinutes; // Minutes from dispatchTime to completionTime (or arrivalTime)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmergencyStatus status;
}
