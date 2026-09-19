package com.smartleave.repository;

import com.smartleave.entity.SecurityOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SecurityRepository extends JpaRepository<SecurityOfficer, Long> {
    Optional<SecurityOfficer> findByEmail(String email);
    boolean existsByEmail(String email);
}
