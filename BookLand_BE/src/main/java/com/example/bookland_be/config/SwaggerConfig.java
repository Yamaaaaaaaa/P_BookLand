package com.example.bookland_be.config;


import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

class SwaggerSecurityName {
    public static final String JWT_AUTH = "JWTAuth";
    public static final String REFRESH_TOKEN_AUTH = "RefreshTokenAuth";
}

@Configuration
public class SwaggerConfig {

    @Value("${app.openapi.dev-url:http://localhost:8080}")
    private String devUrl;

    @Value("${app.openapi.prod-url:https://api.bookland.com}")
    private String prodUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        // Define Security Schemes
        final String bearerAuthScheme = "bearerAuth";
        final String basicAuthScheme = "basicAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Bookland API")
                        .version("1.0.0")
                        .description("API Documentation for Bookland E-commerce System")
                        .contact(new Contact()
                                .name("Bookland Team")
                                .email("support@bookland.com")
                                .url("https://bookland.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url(devUrl).description("Development Server"),
                        new Server().url(prodUrl).description("Production Server")));

    }
}