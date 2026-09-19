package com.smartleave.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalRequest {
    @NotBlank(message = "Action must be APPROVE or REJECT")
    private String action;

    private String remarks;
    private String reason;

    public ApprovalRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
