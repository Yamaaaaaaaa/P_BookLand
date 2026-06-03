package com.example.bookland_be.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbMigration {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrate() {
        try {
            // Update enum schema to include Bill discount types
            jdbcTemplate.execute("ALTER TABLE event_action MODIFY COLUMN action_type ENUM('DISCOUNT_PERCENT', 'DISCOUNT_AMOUNT', 'BILL_DISCOUNT_PERCENT', 'BILL_DISCOUNT_AMOUNT', 'FREE_SHIPPING') NOT NULL;");
            System.out.println("DbMigration: Successfully altered event_action table to include Bill Level Discounts.");
        } catch (Exception e) {
            System.err.println("DbMigration: Error altering event_action table: " + e.getMessage());
        }
    }
}
