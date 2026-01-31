package com.example.bookland_be.service.impl;

import com.example.bookland_be.dto.request.*;
import com.example.bookland_be.dto.response.AuthenticationResponse;
import com.example.bookland_be.dto.response.IntrospectResponse;
import com.example.bookland_be.dto.response.LoginResponse;
import com.example.bookland_be.dto.response.UserResponse;
import com.example.bookland_be.entity.InvalidatedToken;
import com.example.bookland_be.entity.Role;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.mapper.UserMapper;
import com.example.bookland_be.repository.InvalidatedTokenRepository;
import com.example.bookland_be.repository.RoleRepository;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.service.AuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

enum TokenType {
    ACCESS,
    REFRESH
}

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @Autowired
    UserMapper userMapper;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = generateToken(user, TokenType.ACCESS);
        String refreshToken = generateToken(user, TokenType.REFRESH);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn((int) VALID_DURATION)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public LoginResponse adminlogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        System.out.println("role: "+ user.getRoles());
        // Kiểm tra xem user có role ADMIN không
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));

        if (!isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String accessToken = generateToken(user, TokenType.ACCESS);
        String refreshToken = generateToken(user, TokenType.REFRESH);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn((int) VALID_DURATION)
                .tokenType("Bearer")
                .build();
    }



    // --- Service trả lại AccessToken cho người dùng nhờ Refresh Token
        // Hướng làm 1:
        // Bên Client phải check nếu AccessToken gần hết hạn thì gửi 1 API (/refresh) để lấy Access mới
        // Hướng làm 2:
        // Bên Client nếu gọi Request dính 401 => FE gọi API (/refresh) để lấy token
    @Override
    public AuthenticationResponse getTokenByRefresh(RefreshRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = verifyToken(request.getToken(), "REFRESH");

        var name = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user, TokenType.ACCESS);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }


    // --- Service Logout => ko cần trả về j. yêu cầu là nếu có lỗi thì bắn ra Exception => Nhớ Try Catch
        // B1: Verify Token. => Nếu token Invaliated (hết hạn hoặc trong DB Invaliated)
        // B2: Qua đc bước trên => Lưu token đó vào DB Invaliated
    @Override
    public void logout(LogoutRequest logoutRequest) throws JOSEException, ParseException{
        try {
            var signToken = verifyToken(logoutRequest.getToken(), "REFRESH");

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Role userRole = roleRepository.findByName("USER");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.ENABLE)
                .roles(Set.of(userRole))  // Thêm role USER mặc định
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }


    // --- Service lấy refreshToken mới:
        // B1: Nhận Token => Giải mã Token
        // B2: Cho Token cũ đấy ko sd đc nữa (đưa vào DB Invaliated)
        // B3: Tạo Token mới dựa vào thông tin ng dùng (lấy từ token cũ) => Trả về
    @Override
    public AuthenticationResponse refreshToken(RefreshRequest refreshRequest) throws JOSEException, ParseException{
        SignedJWT signedJWT = verifyToken(refreshRequest.getToken(), "REFRESH");

        String jid = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder().id(jid).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);

        var name = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user, TokenType.REFRESH);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        boolean isValid = true;
        try {
            verifyToken(request.getToken(), request.getTokenType());
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }
    private String generateToken(User user, TokenType tokenType) {
        long duration = (tokenType == TokenType.ACCESS)
                ? VALID_DURATION
                : REFRESHABLE_DURATION;

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("kaita")
                .issueTime(new Date())
                .expirationTime(
                        new Date(Instant.now().plus(duration, ChronoUnit.SECONDS).toEpochMilli())
                )
                .jwtID(UUID.randomUUID().toString())
                .claim("type", tokenType.name())
                .claim("scope", tokenType == TokenType.ACCESS ? buildScope(user) : null)
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot generate " + tokenType + " token", e);
        }
    }

    private SignedJWT verifyToken(String token, String tokenType) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        boolean isRefresh = Objects.equals(tokenType, "REFRESH");
        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add("ROLE_" + permission.getName()));
            });

        return stringJoiner.toString();
    }
}
