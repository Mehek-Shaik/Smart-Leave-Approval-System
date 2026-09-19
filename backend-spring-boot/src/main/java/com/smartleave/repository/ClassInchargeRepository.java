package com.smartleave.repository;

import com.smartleave.entity.ClassIncharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClassInchargeRepository extends JpaRepository<ClassIncharge, Long> {
    Optional<ClassIncharge> findByEmail(String email);
    Optional<ClassIncharge> findByDepartmentAndYearAndSection(String department, Integer year, String section);
    boolean existsByEmail(String email);
}
