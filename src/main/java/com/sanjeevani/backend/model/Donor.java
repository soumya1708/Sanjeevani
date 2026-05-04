package com.sanjeevani.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "donors")
@Data // Lombok handles most getters/setters automatically
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Global Fields (Always populated)
    private String assetType; // blood, plasma, stem, organ
    private String name;
    private Integer age;
    private String location; // <--- This fixes your red error!

    // 2. Shared Medical Fields
    private String bloodGroup;
    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    // 3. Blood & Plasma Specific Fields
    private LocalDate lastDonation;
    private LocalDate infectionDate;
    private String antibodyStatus;

    // 4. Stem Cell Specific Fields
    private Boolean swabConsent;

    // 5. Organ Specific Fields
    private String organsPledged; // Example: "heart, lungs, kidney"
    private String hospitalRegistry; // NOTTO ID or similar

    // ==========================================
    // MANUAL GETTER/SETTER (Safety override for Lombok)
    // ==========================================
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}