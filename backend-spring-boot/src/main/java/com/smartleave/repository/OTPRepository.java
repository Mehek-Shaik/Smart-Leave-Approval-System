package com.smartleave.repository;

import com.smartleave.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByOtpCode(String otpCode);
    Optional<OTP> findByLeaveId(Long leaveId);
}
