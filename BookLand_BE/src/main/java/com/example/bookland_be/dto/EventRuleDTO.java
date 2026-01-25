package com.example.bookland_be.dto;

import com.example.bookland_be.enums.EventRuleType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRuleDTO {
    private Long id;
    private EventRuleType ruleType;
    private String ruleValue;
}