package com.smartleave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OTPVerifyRequest {
    @NotBlank(message = "OTP code is required")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    private String otpCode;

    private String queryIdentifier;
    private String gateNumber;

    public OTPVerifyRequest() {}

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public String getQueryIdentifier() { return queryIdentifier; }
    public void setQueryIdentifier(String queryIdentifier) { this.queryIdentifier = queryIdentifier; }

    public String getGateNumber() { return gateNumber; }
    public void setGateNumber(String gateNumber) { this.gateNumber = gateNumber; }
}
