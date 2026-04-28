package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.model.Donor;
import com.sanjeevani.backend.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") // The VIP Pass for the frontend!
@RestController
@RequestMapping("/api/donors")
public class DonorController {

    @Autowired
    private DonorRepository donorRepository;

    // This handles the GET request (Scanning for donors)
    @GetMapping
    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    // This handles the POST request (Registering a new donor)
    @PostMapping
    public Donor addDonor(@RequestBody Donor donor) {
        return donorRepository.save(donor);
    }
}
