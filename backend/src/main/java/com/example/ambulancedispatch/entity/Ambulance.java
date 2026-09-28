package com.example.ambulancedispatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ambulances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ambulanceNumber;

    @Column(nullable = false, length = 100)
    private String driverName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_zone_id", nullable = false)
    private Zone homeZone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_zone_id", nullable = false)
    private Zone currentZone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AmbulanceStatus status;

    @Column(nullable = false)
    private LocalDate registrationDate;
}
