package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    // This allows us to search for donors by blood group later!
    List<Donor> findByBloodGroupAndIsAvailableTrue(String bloodGroup);
}