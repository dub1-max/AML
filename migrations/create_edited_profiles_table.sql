-- Create edited_profiles table to store profile edit history
CREATE TABLE IF NOT EXISTS edited_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    original_name VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    resident_status VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(3),
    country_of_residence VARCHAR(3),
    other_nationalities BOOLEAN DEFAULT FALSE,
    specified_other_nationalities VARCHAR(3),
    national_id_number VARCHAR(100),
    national_id_expiry DATE,
    passport_number VARCHAR(100),
    passport_expiry DATE,
    address TEXT,
    state VARCHAR(100),
    city VARCHAR(100),
    zip_code VARCHAR(20),
    contact_number VARCHAR(50),
    dialing_code VARCHAR(10),
    work_type VARCHAR(50),
    industry VARCHAR(100),
    product_type_offered VARCHAR(50),
    product_offered VARCHAR(255),
    company_name VARCHAR(255),
    position_in_company VARCHAR(100),
    edited_by VARCHAR(100),
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile_id (profile_id),
    INDEX idx_original_name (original_name),
    INDEX idx_edited_at (edited_at)
);

-- Add a trigger to record edits to the profiles table (if needed)
-- This is optional if you're handling edits exclusively through your API
DELIMITER //
CREATE TRIGGER after_profile_update
AFTER UPDATE ON persons
FOR EACH ROW
BEGIN
    -- Check if this is a profile update (not a tracking status change)
    IF OLD.name != NEW.name OR OLD.identifiers != NEW.identifiers THEN
        INSERT INTO edited_profiles (
            profile_id,
            original_name,
            full_name,
            email,
            -- Other fields would be populated from the application
            edited_by
        )
        VALUES (
            NEW.id,
            OLD.name,
            NEW.name,
            '', -- Email will be populated by the application
            -- Other fields will be populated by the application
            USER()
        );
    END IF;
END//
DELIMITER ; 