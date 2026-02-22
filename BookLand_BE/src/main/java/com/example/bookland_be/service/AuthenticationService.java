package com.example.bookland_be.service;

import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.dto.response.AuthenticationResponse;
import com.example.bookland_be.dto.response.IntrospectResponse;
import com.example.bookland_be.dto.response.LoginResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;

    public LoginResponse login(LoginRequest request) throws JOSEException, ParseException;

    public LoginResponse adminlogin(LoginRequest request) throws JOSEException, ParseException;

    public AuthenticationResponse getTokenByRefresh(RefreshRequest refreshRequest) throws ParseException, JOSEException;

    public void logout(LogoutRequest logoutRequest) throws JOSEException, ParseException;

    public AuthenticationResponse refreshToken(RefreshRequest refreshRequest) throws JOSEException, ParseException;

    public UserResponse register(RegisterRequest request);
}
