package com.example.bookland_be.controller.admin;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/admin")
@RestController
@SecurityRequirement(name = "BearerAuth")
public class AdminHomeController {
    @GetMapping("/home")
    public String getMethodName() {
        return "Hello HOME RelationShip";
    }
}
