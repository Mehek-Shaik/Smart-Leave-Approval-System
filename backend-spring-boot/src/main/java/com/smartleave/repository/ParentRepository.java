package com.smartleave.repository;

import com.smartleave.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);
    Optional<Parent> findByStudentEmail(String studentEmail);
    boolean existsByEmail(String email);
}
