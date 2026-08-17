# NIXTAP Microservices — Architecture, Data Flow & Security Guide

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NIXTAP PLATFORM                                │
│                                                                         │
│   ┌──────────────────┐         ┌───────────────────────────────────┐   │
│   │  React Frontend  │ ──────► │   Vite Dev Proxy / Reverse Proxy  │   │
│   │  localhost:3000  │         │   forwards /api/** → Gateway       │   │
│   └──────────────────┘         └────────────────┬──────────────────┘   │
│                                                  │                      │
│                                ┌─────────────────▼──────────────────┐  │
│                                │         API GATEWAY                 │  │
│                                │         localhost:8080              │  │
│                                │  ┌──────────────────────────────┐  │  │
│                                │  │  Route Table                 │  │  │
│                                │  │  /api/v1/auth/**     → 8081  │  │  │
│                                │  │  /api/v1/profiles/** → 8082  │  │  │
│                                │  │  /api/v1/social-links/** → 8082 │  │
│                                │  │  /api/v1/cards/**    → 8083  │  │  │
│                                │  │  /api/v1/nfc/**      → 8083  │  │  │
│                                │  │  /api/v1/themes/**   → 8083  │  │  │
│                                │  │  /api/v1/portfolio/**→ 8084  │  │  │
│                                │  │  /api/v1/notifications/**→8085│  │  │
│                                │  │  /api/v1/qr/**       → 8086  │  │  │
│                                │  │  /api/v1/analytics/**→ 8087  │  │  │
│                                │  │  /api/v1/feedback/** → 8091  │  │  │
│                                │  │  /api/v1/meetings/** → 8092  │  │  │
│                                │  │  /api/v1/admin/**    → 8093  │  │  │
│                                │  │  /api/v1/media/**    → 8095  │  │  │
│                                │  └──────────────────────────────┘  │  │
│                                │  CorsWebFilter (allow :3000)       │  │
│                                └──────────────┬─────────────────────┘  │
│                                               │                        │
│                      ┌────────────────────────▼──────────────────┐    │
│                      │         EUREKA SERVICE REGISTRY            │    │
│                      │           localhost:8761                    │    │
│                      │   All services auto-register here           │    │
│                      └────────────────────────────────────────────┘    │
│                                                                         │
│   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐   │
│   │  Auth   │ │Profile  │ │ Biz-Card │ │ Portfolio  │ │   QR     │   │
│   │  :8081  │ │  :8082  │ │  :8083   │ │   :8084    │ │  :8086   │   │
│   │auth_db  │ │profile_db│ │biz_card_db│ │portfolio_db│ │  qr_db  │   │
│   └─────────┘ └─────────┘ └──────────┘ └────────────┘ └──────────┘   │
│                                                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │Analytics │ │Notific.  │ │ Feedback │ │ Meeting  │ │  Admin   │   │
│   │  :8087   │ │  :8085   │ │  :8091   │ │  :8092   │ │  :8093   │   │
│   │analytics_│ │notif._db │ │feedback_db│ │meeting_db│ │admin_db  │   │
│   │   db     │ │          │ │          │ │          │ │          │   │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                                         │
│                      ┌──────────────────────────────┐                 │
│                      │      Media Service :8095      │                 │
│                      │      media_db + file system   │                 │
│                      └──────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Security Flow

### 2a. Registration Flow

```
Client (Browser)
      │
      │  POST /api/v1/auth/register
      │  { fullName, email, password }
      ▼
API Gateway (:8080)
      │  Route → auth-service (:8081)
      ▼
AuthController.register()
      │
      ├─► Validate request (@Valid)
      │     fullName: 2-100 chars
      │     email: valid format
      │     password: 8-32 chars
      │
      ├─► userRepository.existsByEmail(email)
      │     IF exists → throw BadRequestException(400)
      │
      ├─► userMapper.registerRequestToUser(request)
      │     Maps DTO → User entity
      │
      ├─► passwordEncoder.encode(password)
      │     BCrypt (strength 10)
      │
      ├─► user.setRole(Role.USER)          ← always USER, never ADMIN
      ├─► user.setEnabled(true)
      ├─► user.setVerificationCode(UUID)
      │
      ├─► userRepository.save(user)
      │     Persists to auth_db.users
      │
      ├─► emailService.sendVerificationEmail()  ← non-blocking, failure OK
      │
      ├─► jwtUtil.generateTokenFromEmailRoleAndUserId()
      │     Creates JWT: { sub: email, role: ROLE_USER, userId: id }
      │     Signed with HMAC-SHA256 + secret key
      │     Expires: 24 hours
      │
      ├─► createRefreshToken(userId)
      │     UUID token, expires 7 days
      │     Saved to auth_db.refresh_tokens
      │
      └─► Return 201 { accessToken, refreshToken, userId, email, fullName, role }
```

### 2b. Login Flow

```
Client
      │
      │  POST /api/v1/auth/login
      │  { email, password }
      ▼
AuthController.login()
      │
      ├─► authenticationManager.authenticate()
      │     → UserDetailsServiceImpl.loadUserByUsername(email)
      │     → BCryptPasswordEncoder.matches(raw, encoded)
      │     IF mismatch → 401 Unauthorized
      │
      ├─► refreshTokenRepository.deleteByUser(user)  ← delete old token
      │     @Modifying JPQL DELETE (avoids duplicate key on re-login)
      │
      ├─► refreshTokenRepository.save(newToken)
      │
      ├─► jwtUtil.generateTokenFromEmailRoleAndUserId()
      │
      └─► Return 200 { accessToken, refreshToken, ... }
```

### 2c. Authenticated Request Flow

```
Client
      │
      │  GET /api/v1/profiles/me
      │  Header: Authorization: Bearer <accessToken>
      ▼
API Gateway (:8080)
      │  Route match → profile-service (:8082)
      │  (No JWT validation at gateway — gateway is a pure router)
      ▼
JwtAuthenticationFilter (OncePerRequestFilter)
      │
      ├─► parseJwt(request)
      │     Extract token from "Authorization: Bearer ..." header
      │
      ├─► jwtUtil.validateJwtToken(token)
      │     Verifies HMAC-SHA256 signature + expiry
      │     IF invalid → skip, SecurityContext stays empty → 401
      │
      ├─► jwtUtil.getEmailFromJwtToken(token)
      │
      ├─► userDetailsService.loadUserByUsername(email)
      │     Loads UserDetails from service's own DB / JWT claims
      │
      ├─► Set SecurityContextHolder authentication
      │     principal = AuthenticatedUser { userId, email, role }
      │
      ▼
SecurityConfig.filterChain
      │
      ├─► anyRequest().authenticated()  → passes (token valid)
      ▼
Controller Method
      │
      ├─► @AuthenticationPrincipal AuthenticatedUser principal
      │     principal.getUserId() → used for ownership checks
      │
      └─► Return 200 response
```

### 2d. Token Refresh Flow

```
Client (access token expired — 401 received)
      │
      ├─► axios interceptor catches 401
      ├─► Reads refreshToken from localStorage
      │
      │  POST /api/v1/auth/refresh
      │  { refreshToken: "uuid-string" }
      ▼
AuthController.refreshToken()
      │
      ├─► refreshTokenRepository.findByToken(token)
      │     IF not found → throw TokenRefreshException (403)
      │
      ├─► verifyExpiration(refreshToken)
      │     IF expired → delete + throw TokenRefreshException (403)
      │
      ├─► Generate new accessToken (24h)
      │
      └─► Return { accessToken, refreshToken (same), ... }
            │
            ▼
      axios interceptor:
      ├─► localStorage.setItem('accessToken', newToken)
      ├─► Retry all queued failed requests
      └─► Continue normally
```

### 2e. Logout Flow

```
Client
      │
      │  POST /api/v1/auth/logout
      │  Header: Authorization: Bearer <token>
      ▼
AuthController.logout()
      │
      ├─► IF @AuthenticationPrincipal is null → return 200 "Already logged out"
      │
      ├─► refreshTokenRepository.deleteByUser(user)
      │     Revokes the refresh token server-side
      │
      └─► Return 200 "Logged out"
            │
            ▼
      Frontend (AuthContext.logout()):
      ├─► localStorage.removeItem('accessToken')
      ├─► localStorage.removeItem('refreshToken')
      ├─► localStorage.removeItem('user')
      └─► setUser(null) → redirect to /login
```

---

## 3. JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }

Payload: {
  "sub":    "user@email.com",      ← email (subject)
  "role":   "ROLE_USER",           ← Spring Security role
  "userId": 42,                    ← database user ID
  "iat":    1722700000,            ← issued at (epoch)
  "exp":    1722786400             ← expires (iat + 24h)
}

Signature: HMAC-SHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

**Key: `JWT_SECRET` environment variable**
- Minimum 256-bit (32 bytes) — currently a 64-char hex string
- Same secret shared by auth-service (signs) and all other services (verify)
- Set via: `java -DJWT_SECRET=<value> -jar service.jar`

---

## 4. Security Layers Per Service

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY CHAIN (each service)                  │
│                                                                    │
│  Request arrives                                                   │
│       │                                                            │
│       ▼                                                            │
│  [1] CSRF disabled (stateless JWT — no session cookies)           │
│       │                                                            │
│       ▼                                                            │
│  [2] CorsWebFilter (api-gateway only)                             │
│       Checks Origin header vs allowed list                         │
│       │                                                            │
│       ▼                                                            │
│  [3] JwtAuthenticationFilter (all services except gateway)        │
│       Validates token, populates SecurityContext                   │
│       │                                                            │
│       ▼                                                            │
│  [4] SecurityFilterChain.authorizeHttpRequests                    │
│       Public paths  → permitAll()                                  │
│       Protected paths → authenticated()                            │
│       Admin paths   → hasRole("ADMIN")                             │
│       │                                                            │
│       ▼                                                            │
│  [5] Controller method                                             │
│       assertOwner(userId) → ResponseStatusException(403)          │
│       if not resource owner                                        │
│       │                                                            │
│       ▼                                                            │
│  [6] GlobalExceptionHandler                                        │
│       ResponseStatusException → correct HTTP status (not 500)     │
│       MethodArgumentNotValidException → 422                        │
│       ResourceNotFoundException → 404                              │
└──────────────────────────────────────────────────────────────────┘
```

### Public vs Protected Endpoints

| Service | Public (no JWT) | Protected (JWT required) | Admin only |
|---|---|---|---|
| auth | `/register` `/login` `/refresh` `/forgot-password` `/reset-password` `/verify-email` | `/logout` | — |
| profile | `/profiles/public/{id}` | `/profiles/me` `/social-links/**` | `/profiles` (list all) `/profiles/admin/**` |
| business-card | `/cards/public/slug/{slug}` `/nfc/tags/uid/**` | all other `/cards/**` `/nfc/**` | `POST /themes` `PUT /themes/**` |
| portfolio | `/portfolio/public/user/{id}` | all other `/portfolio/**` | — |
| qr | `/qr/scan/{code}` | `/qr/**` | — |
| analytics | — | `/analytics/**` | — |
| feedback | `GET /feedback/card/{id}` `GET /feedback/card/{id}/summary` | write/read-all feedback | — |
| meeting | `PUT /meetings/cancel-by-token` | all other `/meetings/**` | — |
| notification | — | `/notifications/**` | — |
| media | — | `/media/**` | — |
| admin | — | — | all `/admin/**` |

---

## 5. Complete User Journey — Data Flow

```
USER ACTION: "Register → Create Card → Share via NFC tap"

Step 1 — REGISTER
─────────────────
Browser → POST /api/v1/auth/register
                    │
                    ▼
              auth_db.users  (BCrypt password stored)
              auth_db.refresh_tokens (new token)
                    │
                    ▼
            Response: { accessToken (JWT), refreshToken }
                    │
                    ▼
            localStorage: { accessToken, refreshToken, user }

Step 2 — UPDATE PROFILE
────────────────────────
Browser → PUT /api/v1/profiles/me  (Bearer token)
                    │
                    ▼
          JwtAuthFilter validates token → userId = 42
                    │
                    ▼
          profile_db.user_profiles (bio, headline, location, etc.)

Step 3 — CREATE BUSINESS CARD
───────────────────────────────
Browser → POST /api/v1/cards
          { cardTitle: "My Card", designation: "Dev", theme: "midnight-indigo" }
                    │
                    ▼
          JwtAuthFilter → userId = 42
          createCard():
            card.userId = 42  (from JWT, not request body)
            card.slug = auto-generated from cardTitle
            card.theme = "midnight-indigo"
                    │
                    ▼
          business_card_db.business_cards

Step 4 — GENERATE QR CODE
──────────────────────────
Browser → POST /api/v1/qr/generate  { cardId: 1, label: "Office card" }
                    │
                    ▼
          QR PNG generated → saved to ./qr-storage/
          qr_db.qr_codes (qrCode UUID, imageUrl, cardId, userId)
                    │
                    ▼
          Response: { qrCode: "uuid", imageUrl: "/qr-storage/uuid.png" }

Step 5 — SOMEONE TAPS THE NFC / SCANS QR
──────────────────────────────────────────
Phone → GET /api/v1/cards/public/slug/my-card-slug  (NO auth needed)
                    │
                    ▼
          Returns card data: cardTitle, designation, company, theme
                    │
                    ▼
Phone → POST /api/v1/analytics/track
          { ownerId: "42", cardId: "1", eventType: "CARD_VIEW", source: "NFC" }
                    │
                    ▼
          analytics_db.analytics_events

Step 6 — VISITOR BOOKS A MEETING
──────────────────────────────────
Phone → POST /api/v1/meetings/request  (NO auth needed for guest)
          { hostUserId: 42, guestName: "Jane", guestEmail: "jane@co.com",
            proposedTime: "2027-01-15T10:00:00", durationMinutes: 30,
            agenda: "Product demo", cardId: 1 }
                    │
                    ▼
          meeting_db.meetings
          cancellationToken generated (UUID) → returned to guest

Step 7 — CARD OWNER VIEWS ANALYTICS
──────────────────────────────────────
Browser → GET /api/v1/analytics/dashboard  (Bearer token)
                    │
                    ▼
          Returns top-10 events for authenticated userId
```

---

## 6. Database Schema Overview

```
auth_db
├── users              (id, email, password[BCrypt], full_name, role, enabled,
│                       email_verified, verification_code, created_at, updated_at)
├── refresh_tokens     (id, user_id[FK→users], token[unique], expiry_date)
└── password_reset_tokens (id, user_id[FK→users], token[unique], expiry_date)

profile_db
├── user_profiles      (id, user_id[idx], bio, headline, location, website,
│                       avatar_url, is_public, created_at, updated_at)
├── social_links       (id, user_id[idx], platform, url, created_at)
└── contacts           (id, user_id[idx], ...)

business_card_db
├── business_cards     (id, user_id[idx], card_title, designation, company,
│                       theme[not null], slug[unique,idx], is_public,
│                       profile_image, cover_image, created_at, updated_at)
├── themes             (id, name, slug[unique], gradient, primary_color, ...)
└── nfc_tags           (id, uid[unique], card_id[FK], tag_type, status, linked_at)

portfolio_db
├── projects           (id, user_id[idx], title, description, project_url, ...)
├── experiences        (id, user_id[idx], company, designation, start_date, ...)
├── education          (id, user_id[idx], institution, degree, ...)
├── skills             (id, user_id[idx], name, proficiency_level, ...)
├── certificates       (id, user_id[idx], name, issuing_org, issue_date, ...)
├── resumes            (id, user_id[idx], resume_url, original_file_name, ...)
├── awards             (id, user_id[idx], title, issuer, year, ...)
└── languages          (id, user_id[idx], name, proficiency_level, ...)

qr_db
└── qr_codes           (id, user_id[idx], card_id[idx], qr_code[unique],
                         label, image_url, scan_count, created_at)

analytics_db
└── analytics_events   (id, owner_id[idx], card_id, event_type, source,
                         ip_address, user_agent, created_at)

notification_db
├── notification_logs  (id, user_id[idx], type, title, message,
│                       is_read[idx], created_at)
└── notification_preferences (id, user_id[unique], email_enabled,
                               sms_enabled, push_enabled)

feedback_db
└── feedbacks          (id, card_id[idx], reviewer_name, rating[1-5],
                         comment, reply, owner_id[idx], created_at)

meeting_db
└── meetings           (id, host_user_id[idx], guest_name, guest_email,
                         proposed_time, duration_minutes, agenda, status,
                         cancellation_token[unique], card_id, created_at)

admin_db
└── admin_audit_logs   (id, admin_user_id, action, target_entity,
                         target_id, detail, created_at)

media_db
└── media_files        (id, user_id[idx], original_name, stored_name,
                         media_type, file_size, public_url, created_at)
```

---

## 7. Service Communication

```
INTER-SERVICE COMMUNICATION

┌─────────────────────────────────────────────────────────────┐
│  Currently: NO direct service-to-service calls at runtime   │
│                                                              │
│  Each service is INDEPENDENT:                               │
│  - Has its own database                                      │
│  - Validates JWT independently (shared secret)              │
│  - Does not call other services                             │
│                                                              │
│  Admin-service has Feign client STUBS defined               │
│  (currently return zeros — admin endpoints not yet          │
│  implemented on target services)                             │
│                                                              │
│  Service discovery via Eureka:                              │
│  - All services register at startup                         │
│  - Gateway uses lb://SERVICE-NAME for load-balanced routing  │
│  - If a service is down, gateway returns 503                │
└─────────────────────────────────────────────────────────────┘

Future state (when admin endpoints added):
admin-service ──Feign──► auth-service     GET /admin/users
admin-service ──Feign──► biz-card-service GET /admin/cards
admin-service ──Feign──► analytics-service GET /admin/stats
```

---

## 8. Environment Variables Required

```
Variable            Used By                 Example
────────────────────────────────────────────────────────────────────
JWT_SECRET          all services            9A2F8C7D... (64-char hex)
DB_PASSWORD         all services            YourMySQLPassword
DB_URL              all (optional)          jdbc:mysql://localhost:3306/auth_db?...
DB_USERNAME         all (optional, def:root) root
MAIL_USERNAME       auth, notification      your@gmail.com
MAIL_PASSWORD       auth, notification      app-specific-password
APP_BASE_URL        auth, notification      http://localhost:8081
MAIL_HOST           auth, notification      smtp.gmail.com
MAIL_PORT           auth, notification      587
QR_STORAGE_PATH     qr-service              ./qr-storage
MEDIA_STORAGE_PATH  media-service           ./media-storage
MEDIA_BASE_URL      media-service           http://localhost:8095
```

---

## 9. Startup Order

```
1. MySQL must be running         (port 3306)
   └─ Databases auto-created by Hibernate (createDatabaseIfNotExist=true)

2. eureka-server                 (port 8761)
   └─ All other services depend on Eureka being available

3. All microservices (parallel)
   auth-service       :8081
   profile-service    :8082
   business-card-service :8083
   portfolio-service  :8084
   notification-service :8085
   qr-service         :8086
   analytics-service  :8087
   feedback-service   :8091
   meeting-service    :8092
   admin-service      :8093
   media-service      :8095

4. api-gateway                   (port 8080)
   └─ Start after services are registered in Eureka

5. Frontend (Vite dev server)    (port 3000)
   └─ npm run dev inside nixtap-frontend/
   └─ Proxy /api → localhost:8080 (configured in vite.config.js)
```

---

## 10. Password & Credential Security

```
Passwords at rest:
  - BCryptPasswordEncoder (strength 10 = ~100ms hash time)
  - Never stored in plaintext
  - Never returned in any API response

JWT secret:
  - Must be ≥256 bits (32 bytes)
  - Set via environment variable only (never hardcoded in production)
  - Same value shared across all services

Reset tokens:
  - UUID v4 (random 128-bit)
  - Expire after 2 hours
  - Single-use (deleted after successful reset)
  - Sent only to the verified email address

Refresh tokens:
  - UUID v4 (random 128-bit)
  - Expire after 7 days
  - One token per user (old token deleted on new login)
  - Stored server-side (can be revoked by logout)
```

---

## 11. Error Response Format (All Services)

```json
{
  "timestamp": "2026-08-05T10:30:00.123",
  "status":    422,
  "message":   "{email=Invalid email format, password=Password must be 8-32 chars}",
  "path":      "/api/v1/auth/register",
  "errorCode": "VALIDATION_FAILED"
}
```

| HTTP Status | errorCode | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Duplicate email, invalid token, business rule violation |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Valid JWT but wrong owner / insufficient role |
| 403 | `INVALID_REFRESH_TOKEN` | Expired or unknown refresh token |
| 404 | `RESOURCE_NOT_FOUND` | Entity not found |
| 422 | `VALIDATION_FAILED` | `@Valid` constraint violation |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected error (logged server-side) |
| 501 | — | Admin endpoints not yet implemented |

---

## 12. Frontend Security

```
Token Storage:
  localStorage.accessToken   → JWT (24h)
  localStorage.refreshToken  → UUID (7 days)
  localStorage.user          → { userId, email, fullName, role }

  ⚠ localStorage is vulnerable to XSS.
  For production: move to httpOnly cookies.

Auto-refresh (axios.js interceptor):
  1. Every request adds "Authorization: Bearer <accessToken>"
  2. On 401 response:
     a. Read refreshToken from localStorage
     b. POST /api/v1/auth/refresh
     c. Save new accessToken
     d. Retry all queued requests
     e. On refresh failure → clear storage → redirect to /login

Route guards:
  ProtectedRoute: redirect to /login if !user || !accessToken
  AdminRoute:     redirect to /dashboard if role !== ROLE_ADMIN

CORS (Development):
  Vite proxy forwards /api → :8080 → no CORS header needed in browser

CORS (Production):
  CorsWebFilter in api-gateway allows configured origins
  Configure ALLOWED_ORIGINS env var for your production domain
```
