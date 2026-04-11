package com.apimonitor.dto.alert;

import com.apimonitor.model.AlertRule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAlertRuleRequest {

    @NotNull
    private AlertRule.AlertType alertType;

    @NotBlank
    @Size(max = 500)
    private String destination;
}
