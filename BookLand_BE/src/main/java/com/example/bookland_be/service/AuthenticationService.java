package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.LoginRequest;
import com.example.bookland_be.dto.response.LoginResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    public LoginResponse login(LoginRequest request) throws JOSEException, ParseException ;
//    public AuthenticationResponse authenticate(AuthenticationRequest request);
//    public void logout(LogoutRequest logoutRequest) throws JOSEException, ParseException;
//    public AuthenticationResponse refreshToken(RefreshRequest refreshRequest)  throws JOSEException, ParseException;
//
//    // OAuth voi KeyCloak:
//    public UserResponse handleRegister(UserCreationRequest userCreationRequestDTO);
//    public void logoutKeycloak(String refreshToken);
}
