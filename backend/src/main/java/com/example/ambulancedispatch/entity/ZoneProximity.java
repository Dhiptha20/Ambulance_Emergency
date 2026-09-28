package com.example.ambulancedispatch.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zone_proximities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"from_zone_id", "to_zone_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneProximity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_zone_id", nullable = false)
    private Zone fromZone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_zone_id", nullable = false)
    private Zone toZone;

    @Column(nullable = false)
    private Double distance; // in kilometers

    @Column(nullable = false)
    private Integer estimatedTravelTime; // in minutes
}
