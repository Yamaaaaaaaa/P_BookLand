package com.example.bookland_be.controller.common;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@SecurityRequirement(name = "BearerAuth")
public class HomeController {
    @GetMapping("/home")
    public String getMethodName() {
        return "Hello Test RelationShip";
    }
}
