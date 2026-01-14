package io.github.kaita.bookland_backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SecurityRequirement(name = "BearerAuth")
public class HomeController {
    @GetMapping("/")
    public String getMethodName() {
        return "Hello Test RelationShip";
    }
}
