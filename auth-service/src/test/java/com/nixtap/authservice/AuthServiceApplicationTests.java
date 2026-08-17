package com.nixtap.authservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test: verifies the Spring application context loads without errors.
 *
 * Uses an in-memory H2 datasource so the test does not require a running MySQL
 * instance. All sensitive values (JWT secret, mail credentials) are supplied as
 * test properties to satisfy @Value injection without real external services.
 */
@SpringBootTest
@TestPropertySource(properties = {
    // Override MySQL datasource with H2 in-memory for testing
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    // Satisfy JWT @Value bindings
    "jwt.secret=9A2F8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0C9D8E7F6A5B4C3D2E1F0A9B",
    "jwt.expiration-ms=86400000",
    "jwt.refresh-expiration-ms=604800000",
    // Satisfy mail @Value bindings (no real mail server needed for context load)
    "spring.mail.host=localhost",
    "spring.mail.port=1025",
    "spring.mail.username=test@test.com",
    "spring.mail.password=dummy",
    "app.base-url=http://localhost:8081",
    // Disable Eureka registration during tests
    "eureka.client.enabled=false",
    "eureka.client.register-with-eureka=false",
    "eureka.client.fetch-registry=false"
})
class AuthServiceApplicationTests {

    @Test
    void contextLoads() {
        // Passes if the Spring context starts without throwing an exception
    }
}
