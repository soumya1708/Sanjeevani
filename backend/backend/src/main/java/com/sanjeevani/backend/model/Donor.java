package com.sanjeevani.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "donors")
@Data // This comes from the Lombok plugin you installed!
public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String bloodGroup;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable = true;
}
