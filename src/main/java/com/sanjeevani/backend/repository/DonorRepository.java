package com.sanjeevani.backend.repository;

import com.sanjeevani.backend.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    // This is the magic line your Controller is looking for!
    List<Donor> findByAssetTypeAndBloodGroup(String assetType, String bloodGroup);
}