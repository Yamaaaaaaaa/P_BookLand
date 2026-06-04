# Lược đồ Tuần tự Xác thực (Authentication Sequence Diagram) - PTIT BookLand

Tài liệu này chứa các lược đồ tuần tự (Sequence Diagram) mô tả các luồng nghiệp vụ Xác thực (Authentication) của hệ thống **PTIT BookLand** bằng cú pháp **Mermaid**.

Các luồng bao gồm:
1. **Đăng nhập hệ thống (Standard Login)**
2. **Đăng ký tài khoản (User Registration)**
3. **Đăng xuất tài khoản (Logout & Blacklist Token)**
4. **Làm mới Access Token (Token Refresh)**
5. **Đăng nhập qua Google (Google Login)**

---

## 1. Đăng nhập hệ thống (Standard Login)

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client (User)
    participant Ctrl as AuthenticationController
    participant Svc as AuthenticationServiceImpl
    participant UserRepo as UserRepository
    participant Encoder as PasswordEncoder

    Client->>Ctrl: POST /auth/login (LoginRequest)
    activate Ctrl
    Ctrl->>Svc: login(LoginRequest)
    activate Svc

    Svc->>UserRepo: findByEmail(email)
    activate UserRepo
    UserRepo-->>Svc: Optional~User~
    deactivate UserRepo

    alt User không tồn tại
        Svc-->>Ctrl: Throw AppException (USER_NOT_EXISTED)
        Ctrl-->>Client: 400 Bad Request / 404 Not Found
    else User tồn tại
        Svc->>Encoder: matches(rawPassword, hashedPassword)
        activate Encoder
        Encoder-->>Svc: boolean (true/false)
        deactivate Encoder

        alt Mật khẩu không trùng khớp
            Svc-->>Ctrl: Throw AppException (UNAUTHENTICATED)
            Ctrl-->>Client: 401 Unauthenticated
        else Mật khẩu hợp lệ
            Svc->>Svc: generateToken(user, ACCESS)
            Svc->>Svc: generateToken(user, REFRESH)
            Svc-->>Ctrl: LoginResponse (AccessToken, RefreshToken)
            deactivate Svc
            Ctrl-->>Client: 200 OK (ApiResponse~LoginResponse~)
            deactivate Ctrl
        end
    end
```

---

## 2. Đăng ký tài khoản (User Registration)

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client (User)
    participant Ctrl as AuthenticationController
    participant Svc as AuthenticationServiceImpl
    participant UserRepo as UserRepository
    participant RoleRepo as RoleRepository
    participant Encoder as PasswordEncoder

    Client->>Ctrl: POST /auth/register (RegisterRequest)
    activate Ctrl
    Ctrl->>Svc: register(RegisterRequest)
    activate Svc

    Svc->>UserRepo: existsByUsername(username)
    activate UserRepo
    UserRepo-->>Svc: boolean (true/false)
    deactivate UserRepo

    alt Username đã tồn tại
        Svc-->>Ctrl: Throw AppException (USER_EXISTED)
        Ctrl-->>Client: 400 Bad Request (Username existed)
    else Username khả dụng
        Svc->>UserRepo: existsByEmail(email)
        activate UserRepo
        UserRepo-->>Svc: boolean (true/false)
        deactivate UserRepo

        alt Email đã tồn tại
            Svc-->>Ctrl: Throw AppException (EMAIL_EXISTED)
            Ctrl-->>Client: 400 Bad Request (Email existed)
        else Email khả dụng
            Svc->>RoleRepo: findByName("USER")
            activate RoleRepo
            RoleRepo-->>Svc: Role (USER)
            deactivate RoleRepo

            Svc->>Encoder: encode(rawPassword)
            activate Encoder
            Encoder-->>Svc: hashedPassword
            deactivate Encoder

            Svc->>UserRepo: save(newUser)
            activate UserRepo
            UserRepo-->>Svc: User (saved)
            deactivate UserRepo

            Svc-->>Ctrl: UserResponse
            deactivate Svc
            Ctrl-->>Client: 200 OK (ApiResponse~UserResponse~)
            deactivate Ctrl
        end
    end
```

---

## 3. Đăng xuất tài khoản (Logout & Blacklist Token)
*Luồng này vô hiệu hóa Refresh Token của người dùng bằng cách đưa khóa nhận diện token (JTI) vào danh sách đen (Blacklist).*

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client
    participant Ctrl as AuthenticationController
    participant Svc as AuthenticationServiceImpl
    participant InvalidRepo as InvalidatedTokenRepository

    Client->>Ctrl: POST /auth/logout (LogoutRequest)
    activate Ctrl
    Ctrl->>Svc: logout(LogoutRequest)
    activate Svc

    Svc->>Svc: verifyToken(token, "REFRESH")
    
    alt Token không hợp lệ hoặc hết hạn
        Svc-->>Ctrl: Bỏ qua (Log "Token already expired")
    else Token hợp lệ
        Svc->>InvalidRepo: save(InvalidatedToken)
        activate InvalidRepo
        InvalidRepo-->>Svc: InvalidatedToken
        deactivate InvalidRepo
    end

    Svc-->>Ctrl: void
    deactivate Svc
    Ctrl-->>Client: 200 OK (ApiResponse~Void~)
    deactivate Ctrl
```

---

## 4. Làm mới Access Token (Token Refresh)
*Client sử dụng Refresh Token hợp lệ để yêu cầu hệ thống cấp phát một Access Token mới ngắn hạn.*

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client
    participant Ctrl as AuthenticationController
    participant Svc as AuthenticationServiceImpl
    participant InvalidRepo as InvalidatedTokenRepository
    participant UserRepo as UserRepository

    Client->>Ctrl: POST /auth/refresh (RefreshRequest)
    activate Ctrl
    Ctrl->>Svc: getTokenByRefresh(RefreshRequest)
    activate Svc

    Svc->>Svc: verifyToken(token, "REFRESH")
    
    alt Token không hợp lệ/hết hạn/nằm trong Blacklist
        Svc-->>Ctrl: Throw AppException (UNAUTHENTICATED)
        Ctrl-->>Client: 401 Unauthenticated
    else Token REFRESH hợp lệ
        Svc->>UserRepo: findByEmail(email)
        activate UserRepo
        UserRepo-->>Svc: Optional~User~
        deactivate UserRepo

        alt Không tìm thấy người dùng
            Svc-->>Ctrl: Throw AppException (UNAUTHENTICATED)
            Ctrl-->>Client: 401 Unauthenticated
        else Người dùng hợp lệ
            Svc->>Svc: generateToken(user, ACCESS)
            Svc-->>Ctrl: AuthenticationResponse (new AccessToken)
            deactivate Svc
            Ctrl-->>Client: 200 OK (ApiResponse~AuthenticationResponse~)
            deactivate Ctrl
        end
    end
```

---

## 5. Đăng nhập qua Google (Google Login OAuth2)
*FE đăng nhập Google lấy id_token rồi gửi lên BE xác thực và tự động tạo tài khoản nếu là email mới.*

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client
    participant Ctrl as AuthenticationController
    participant Svc as AuthenticationServiceImpl
    participant GoogleJWKS as Google JWKS Endpoint
    participant UserRepo as UserRepository
    participant RoleRepo as RoleRepository

    Client->>Ctrl: POST /auth/google (GoogleLoginRequest)
    activate Ctrl
    Ctrl->>Svc: loginWithGoogle(GoogleLoginRequest)
    activate Svc

    Svc->>GoogleJWKS: Verify & Decode id_token (certs)
    activate GoogleJWKS
    GoogleJWKS-->>Svc: GoogleJwt Claims (email, name, ...)
    deactivate GoogleJWKS

    alt Token Google không hợp lệ
        Svc-->>Ctrl: Throw AppException (UNAUTHENTICATED)
        Ctrl-->>Client: 401 Unauthenticated
    else Token Google hợp lệ
        Svc->>UserRepo: findByEmail(email)
        activate UserRepo
        UserRepo-->>Svc: Optional~User~
        deactivate UserRepo

        alt Email chưa tồn tại trong hệ thống (Tạo mới)
            Svc->>RoleRepo: findByName("USER")
            activate RoleRepo
            RoleRepo-->>Svc: Role (USER)
            deactivate RoleRepo
            
            Svc->>UserRepo: save(newUser)
            activate UserRepo
            UserRepo-->>Svc: User (saved)
            deactivate UserRepo
        end

        Svc->>Svc: generateToken(user, ACCESS)
        Svc->>Svc: generateToken(user, REFRESH)
        Svc-->>Ctrl: LoginResponse (Tokens)
        deactivate Svc
        Ctrl-->>Client: 200 OK (ApiResponse~LoginResponse~)
        deactivate Ctrl
    end
```
