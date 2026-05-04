package com.sanjeevani.backend.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sanjeevani.backend.repository.DonorRepository;
import com.sanjeevani.backend.model.Donor;

import java.util.List;
import java.util.stream.Collectors;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*") // The VIP Pass for the frontend!
@RestController
@RequestMapping("/api/donors")
public class DonorController {
    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private GeminiTriageService geminiService;


    // ==========================================
    // 1. STANDARD REGISTRATION (The Catcher's Mitt)
    // ==========================================
    @PostMapping
    public ResponseEntity<?> addDonor(@RequestBody Donor donor) {
        try {
            // 1. Send the medical history to Gemini for a "Risk Assessment"
            String triageResult = geminiService.triageDonor(donor.getMedicalHistory());

            // 2. If the AI says REJECTED, stop right here!
            if (triageResult != null && triageResult.contains("REJECTED")) {
                return ResponseEntity.status(406).body(triageResult);
            }

            // 3. Only if it passes the AI, save it to the cloud database
            Donor savedDonor = donorRepository.save(donor);
            return ResponseEntity.ok(savedDonor);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. GET ALL DONORS (Admin/Debug view)
    // ==========================================
    @GetMapping
    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    // ==========================================
    // 3. LIVE MEDICAL RADAR (The Geo-Spatial Engine)
    // ==========================================
    @GetMapping("/nearby")
    public ResponseEntity<List<Donor>> getNearbyDonors(
            @RequestParam String assetType,
            @RequestParam String bloodGroup,
            @RequestParam double hospitalLat,
            @RequestParam double hospitalLng,
            @RequestParam(defaultValue = "15.0") double maxRadiusKm) {

        try {
            // 1. Fetch potential matches from the database
            List<Donor> potentialMatches = donorRepository.findByAssetTypeAndBloodGroup(assetType, bloodGroup);

            // 2. Filter them using the Haversine distance formula
            List<Donor> nearbyDonors = potentialMatches.stream()
                    .filter(donor -> {
                        if (donor.getLocation() == null || !donor.getLocation().contains(",")) return false;

                        try {
                            // Parse the "lat, lng" string from the database
                            String[] coords = donor.getLocation().split(",");
                            double donorLat = Double.parseDouble(coords[0].trim());
                            double donorLng = Double.parseDouble(coords[1].trim());

                            // Calculate physical distance
                            double distance = calculateHaversineDistance(hospitalLat, hospitalLng, donorLat, donorLng);

                            // Return true only if they are within the max radius (e.g., 15km)
                            return distance <= maxRadiusKm;
                        } catch (Exception e) {
                            return false; // Skip if location data is corrupted
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(nearbyDonors);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // INTERNAL MATH ENGINE: Haversine Formula
    // ==========================================
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // Radius of the earth in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // Distance in KM
    }
}