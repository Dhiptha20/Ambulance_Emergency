package com.example.ambulancedispatch.config;

import com.example.ambulancedispatch.entity.*;
import com.example.ambulancedispatch.repository.AmbulanceRepository;
import com.example.ambulancedispatch.repository.EmergencyCallRepository;
import com.example.ambulancedispatch.repository.ZoneProximityRepository;
import com.example.ambulancedispatch.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ZoneRepository zoneRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final ZoneProximityRepository zoneProximityRepository;
    private final EmergencyCallRepository emergencyCallRepository;

    @Override
    public void run(String... args) {
        if (zoneRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Seeding initial database data for AmbulanceDispatch...");

        // 1. Seed 5 Zones
        Zone zoneA = Zone.builder().zoneCode("ZONE-A").zoneName("Central District").build();
        Zone zoneB = Zone.builder().zoneCode("ZONE-B").zoneName("North District").build();
        Zone zoneC = Zone.builder().zoneCode("ZONE-C").zoneName("South District").build();
        Zone zoneD = Zone.builder().zoneCode("ZONE-D").zoneName("East District").build();
        Zone zoneE = Zone.builder().zoneCode("ZONE-E").zoneName("West District").build();

        List<Zone> savedZones = zoneRepository.saveAll(Arrays.asList(zoneA, zoneB, zoneC, zoneD, zoneE));
        zoneA = savedZones.get(0);
        zoneB = savedZones.get(1);
        zoneC = savedZones.get(2);
        zoneD = savedZones.get(3);
        zoneE = savedZones.get(4);

        log.info("Seeded 5 zones.");

        // 2. Seed Zone Proximity Mapping
        List<ZoneProximity> proximities = Arrays.asList(
                // Central (A) connections
                ZoneProximity.builder().fromZone(zoneA).toZone(zoneB).distance(5.0).estimatedTravelTime(10).build(),
                ZoneProximity.builder().fromZone(zoneA).toZone(zoneC).distance(8.0).estimatedTravelTime(15).build(),
                ZoneProximity.builder().fromZone(zoneA).toZone(zoneD).distance(6.0).estimatedTravelTime(12).build(),
                ZoneProximity.builder().fromZone(zoneA).toZone(zoneE).distance(7.0).estimatedTravelTime(14).build(),
                // North (B) connections
                ZoneProximity.builder().fromZone(zoneB).toZone(zoneC).distance(11.0).estimatedTravelTime(22).build(),
                ZoneProximity.builder().fromZone(zoneB).toZone(zoneD).distance(4.0).estimatedTravelTime(8).build(),
                ZoneProximity.builder().fromZone(zoneB).toZone(zoneE).distance(9.0).estimatedTravelTime(18).build(),
                // South (C) connections
                ZoneProximity.builder().fromZone(zoneC).toZone(zoneD).distance(6.0).estimatedTravelTime(13).build(),
                ZoneProximity.builder().fromZone(zoneC).toZone(zoneE).distance(5.0).estimatedTravelTime(11).build(),
                // East (D) to West (E)
                ZoneProximity.builder().fromZone(zoneD).toZone(zoneE).distance(8.0).estimatedTravelTime(16).build()
        );
        zoneProximityRepository.saveAll(proximities);
        log.info("Seeded zone proximity network (10 bidirectional pairs).");

        // 3. Seed 8 Ambulances with realistic details
        Ambulance amb1 = Ambulance.builder()
                .ambulanceNumber("AMB-001")
                .driverName("Arun Kumar")
                .homeZone(zoneA)
                .currentZone(zoneA)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(6))
                .build();

        Ambulance amb2 = Ambulance.builder()
                .ambulanceNumber("AMB-002")
                .driverName("Balaji Ramesh")
                .homeZone(zoneB)
                .currentZone(zoneB)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(5))
                .build();

        Ambulance amb3 = Ambulance.builder()
                .ambulanceNumber("AMB-003")
                .driverName("Chetan Sharma")
                .homeZone(zoneC)
                .currentZone(zoneC)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(4))
                .build();

        Ambulance amb4 = Ambulance.builder()
                .ambulanceNumber("AMB-004")
                .driverName("Deepak Verma")
                .homeZone(zoneD)
                .currentZone(zoneD)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(4))
                .build();

        Ambulance amb5 = Ambulance.builder()
                .ambulanceNumber("AMB-005")
                .driverName("Eswar Prasad")
                .homeZone(zoneE)
                .currentZone(zoneE)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(3))
                .build();

        Ambulance amb6 = Ambulance.builder()
                .ambulanceNumber("AMB-006")
                .driverName("Farhan Khan")
                .homeZone(zoneA)
                .currentZone(zoneA)
                .status(AmbulanceStatus.BUSY)
                .registrationDate(LocalDate.now().minusMonths(2))
                .build();

        Ambulance amb7 = Ambulance.builder()
                .ambulanceNumber("AMB-007")
                .driverName("Ganesh Murthy")
                .homeZone(zoneB)
                .currentZone(zoneB)
                .status(AmbulanceStatus.BUSY)
                .registrationDate(LocalDate.now().minusMonths(2))
                .build();

        Ambulance amb8 = Ambulance.builder()
                .ambulanceNumber("AMB-008")
                .driverName("Harish Patel")
                .homeZone(zoneC)
                .currentZone(zoneC)
                .status(AmbulanceStatus.AVAILABLE)
                .registrationDate(LocalDate.now().minusMonths(1))
                .build();

        List<Ambulance> savedAmbs = ambulanceRepository.saveAll(Arrays.asList(amb1, amb2, amb3, amb4, amb5, amb6, amb7, amb8));
        amb1 = savedAmbs.get(0);
        amb2 = savedAmbs.get(1);
        amb3 = savedAmbs.get(2);
        amb4 = savedAmbs.get(3);
        amb5 = savedAmbs.get(4);
        amb6 = savedAmbs.get(5);
        amb7 = savedAmbs.get(6);
        amb8 = savedAmbs.get(7);
        log.info("Seeded 8 ambulances (6 AVAILABLE, 2 BUSY).");

        // 4. Seed Historical and Active Emergency Calls
        LocalDateTime now = LocalDateTime.now();

        List<EmergencyCall> calls = Arrays.asList(
                // Call 1: Historical completed
                EmergencyCall.builder()
                        .callerName("Suresh Menon")
                        .callerPhone("+91 98401 23456")
                        .emergencyDescription("Severe chest pain and difficulty breathing")
                        .callerZone(zoneA)
                        .assignedAmbulance(amb1)
                        .callTime(now.minusDays(5).minusHours(3))
                        .dispatchTime(now.minusDays(5).minusHours(2).minusMinutes(58))
                        .arrivalTime(now.minusDays(5).minusHours(2).minusMinutes(50))
                        .completionTime(now.minusDays(5).minusHours(2).minusMinutes(46))
                        .responseTimeMinutes(12L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 2: Historical completed
                EmergencyCall.builder()
                        .callerName("Priya Sundaram")
                        .callerPhone("+91 98840 87654")
                        .emergencyDescription("Road traffic accident on North Highway")
                        .callerZone(zoneB)
                        .assignedAmbulance(amb2)
                        .callTime(now.minusDays(4).minusHours(6))
                        .dispatchTime(now.minusDays(4).minusHours(5).minusMinutes(59))
                        .arrivalTime(now.minusDays(4).minusHours(5).minusMinutes(50))
                        .completionTime(now.minusDays(4).minusHours(5).minusMinutes(45))
                        .responseTimeMinutes(14L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 3: Historical completed
                EmergencyCall.builder()
                        .callerName("Karthik Raghavan")
                        .callerPhone("+91 97910 11223")
                        .emergencyDescription("Fall from ladder with suspected spinal injury")
                        .callerZone(zoneC)
                        .assignedAmbulance(amb3)
                        .callTime(now.minusDays(3).minusHours(8))
                        .dispatchTime(now.minusDays(3).minusHours(7).minusMinutes(58))
                        .arrivalTime(now.minusDays(3).minusHours(7).minusMinutes(49))
                        .completionTime(now.minusDays(3).minusHours(7).minusMinutes(43))
                        .responseTimeMinutes(15L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 4: Historical completed
                EmergencyCall.builder()
                        .callerName("Meena Natarajan")
                        .callerPhone("+91 94440 99887")
                        .emergencyDescription("Acute asthma attack, unresponsive")
                        .callerZone(zoneD)
                        .assignedAmbulance(amb4)
                        .callTime(now.minusDays(2).minusHours(4))
                        .dispatchTime(now.minusDays(2).minusHours(3).minusMinutes(58))
                        .arrivalTime(now.minusDays(2).minusHours(3).minusMinutes(50))
                        .completionTime(now.minusDays(2).minusHours(3).minusMinutes(48))
                        .responseTimeMinutes(10L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 5: Historical completed
                EmergencyCall.builder()
                        .callerName("Vikram Sethuraman")
                        .callerPhone("+91 99620 33445")
                        .emergencyDescription("Elderly patient stroke symptoms - facial drooping")
                        .callerZone(zoneE)
                        .assignedAmbulance(amb5)
                        .callTime(now.minusDays(1).minusHours(10))
                        .dispatchTime(now.minusDays(1).minusHours(9).minusMinutes(58))
                        .arrivalTime(now.minusDays(1).minusHours(9).minusMinutes(47))
                        .completionTime(now.minusDays(1).minusHours(9).minusMinutes(42))
                        .responseTimeMinutes(16L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 6: Historical completed
                EmergencyCall.builder()
                        .callerName("Ananya Joshi")
                        .callerPhone("+91 98412 55667")
                        .emergencyDescription("Pediatric burn injury")
                        .callerZone(zoneA)
                        .assignedAmbulance(amb1)
                        .callTime(now.minusHours(14))
                        .dispatchTime(now.minusHours(13).minusMinutes(58))
                        .arrivalTime(now.minusHours(13).minusMinutes(51))
                        .completionTime(now.minusHours(13).minusMinutes(49))
                        .responseTimeMinutes(9L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 7: Historical completed
                EmergencyCall.builder()
                        .callerName("Ramesh Chandran")
                        .callerPhone("+91 94450 77889")
                        .emergencyDescription("Severe allergic reaction (Anaphylaxis)")
                        .callerZone(zoneB)
                        .assignedAmbulance(amb2)
                        .callTime(now.minusHours(8))
                        .dispatchTime(now.minusHours(7).minusMinutes(59))
                        .arrivalTime(now.minusHours(7).minusMinutes(51))
                        .completionTime(now.minusHours(7).minusMinutes(48))
                        .responseTimeMinutes(11L)
                        .status(EmergencyStatus.COMPLETED)
                        .build(),

                // Call 8: Active IN_PROGRESS (assigned to amb6)
                EmergencyCall.builder()
                        .callerName("Geetha Shankaran")
                        .callerPhone("+91 98845 11234")
                        .emergencyDescription("High-speed motorcycle collision at Central Roundabout")
                        .callerZone(zoneA)
                        .assignedAmbulance(amb6)
                        .callTime(now.minusMinutes(35))
                        .dispatchTime(now.minusMinutes(33))
                        .arrivalTime(now.minusMinutes(20))
                        .status(EmergencyStatus.IN_PROGRESS)
                        .build(),

                // Call 9: Active ASSIGNED (assigned to amb7)
                EmergencyCall.builder()
                        .callerName("Kavita Iyer")
                        .callerPhone("+91 97100 44556")
                        .emergencyDescription("Uncontrolled seizure in shopping mall")
                        .callerZone(zoneB)
                        .assignedAmbulance(amb7)
                        .callTime(now.minusMinutes(12))
                        .dispatchTime(now.minusMinutes(10))
                        .status(EmergencyStatus.ASSIGNED)
                        .build(),

                // Call 10: Active PENDING (waiting for dispatch from ZONE-C - ready to test Nearest Ambulance algorithm!)
                EmergencyCall.builder()
                        .callerName("Manoj Krishnan")
                        .callerPhone("+91 98409 66778")
                        .emergencyDescription("Cardiac arrest reported at community center")
                        .callerZone(zoneC)
                        .callTime(now.minusMinutes(4))
                        .status(EmergencyStatus.PENDING)
                        .build(),

                // Call 11: Active PENDING (from ZONE-D)
                EmergencyCall.builder()
                        .callerName("Sunita Devi")
                        .callerPhone("+91 98841 77889")
                        .emergencyDescription("Suspected fracture after slipping on wet stairs")
                        .callerZone(zoneD)
                        .callTime(now.minusMinutes(2))
                        .status(EmergencyStatus.PENDING)
                        .build(),

                // Call 12: Cancelled Call
                EmergencyCall.builder()
                        .callerName("Vijay Narayan")
                        .callerPhone("+91 99400 88990")
                        .emergencyDescription("False alarm - patient recovered independently")
                        .callerZone(zoneE)
                        .callTime(now.minusDays(2))
                        .status(EmergencyStatus.CANCELLED)
                        .build()
        );

        emergencyCallRepository.saveAll(calls);
        log.info("Seeded 12 sample emergency calls (7 Completed, 1 In-Progress, 1 Assigned, 2 Pending, 1 Cancelled).");
    }
}
