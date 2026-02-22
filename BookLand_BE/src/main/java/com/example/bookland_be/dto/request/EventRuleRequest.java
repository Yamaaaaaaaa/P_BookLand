package com.example.bookland_be.dto.request;

import com.example.bookland_be.enums.EventRuleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRuleRequest {

    @NotNull(message = "Rule type không được để trống")
    private EventRuleType ruleType;

    @NotBlank(message = "Rule value không được để trống")
    private String ruleValue;
}
