package com.smartleave.repository;

import com.smartleave.entity.HOD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HODRepository extends JpaRepository<HOD, Long> {
    Optional<HOD> findByEmail(String email);
    Optional<HOD> findByDepartment(String department);
    boolean existsByEmail(String email);
}
