package com.example.bookland_be.dto.request;


import java.time.LocalDate;
import java.util.Set;

//import com.example.ecomerce_platform.validator.DobConstraint;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Email(message = "INVALID_EMAIL")
    private String email;

    @Size(min = 8, message = "INVALID_PASSWORD")
    private String password;

    private String username;

    private String firstName;

    private String lastName;

    @JsonFormat(pattern = "yyyy-MM-dd")
//    @DobConstraint(min = 18, message = "INVALID_DOB")
    private LocalDate dob; // DATE trong MySQL → LocalDate\

    Set<String> roleNames;
}
