const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// Get profile by ID
router.get('/profile/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        
        // First try to get data from persons table
        const [persons] = await db.query(
            'SELECT * FROM persons WHERE id = ?',
            [id]
        );
        
        if (persons.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        
        const person = persons[0];
        
        // Check if this person has extended profile info in individualob table
        const [individuals] = await db.query(
            'SELECT * FROM individualob WHERE full_name = ?',
            [person.name]
        );
        
        let profile = {
            id: person.id,
            name: person.name,
            fullName: person.name,
            identifiers: person.identifiers,
            type: person.type,
            country: person.country,
            riskLevel: person.riskLevel,
            dataset: person.dataset
        };
        
        // If found in individualob, add those fields
        if (individuals.length > 0) {
            const individual = individuals[0];
            
            // Merge individual data into profile
            profile = {
                ...profile,
                email: individual.email,
                residentStatus: individual.resident_status,
                gender: individual.gender,
                dateOfBirth: individual.date_of_birth,
                nationality: individual.nationality,
                countryOfResidence: individual.country_of_residence,
                otherNationalities: individual.other_nationalities === 1,
                specifiedOtherNationalities: individual.specified_other_nationalities,
                nationalIdNumber: individual.national_id_number || person.identifiers,
                nationalIdExpiry: individual.national_id_expiry,
                passportNumber: individual.passport_number,
                passportExpiry: individual.passport_expiry,
                address: individual.address,
                state: individual.state,
                city: individual.city,
                zipCode: individual.zip_code,
                contactNumber: individual.contact_number,
                dialingCode: individual.dialing_code,
                workType: individual.work_type,
                industry: individual.industry,
                productTypeOffered: individual.product_type_offered,
                productOffered: individual.product_offered,
                companyName: individual.company_name,
                positionInCompany: individual.position_in_company
            };
        }
        
        return res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Update profile
router.post('/updateProfile/:id', isAuthenticated, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const {
            originalName,
            fullName,
            email,
            residentStatus,
            gender,
            dateOfBirth,
            nationality,
            countryOfResidence,
            otherNationalities,
            specifiedOtherNationalities,
            nationalIdNumber,
            nationalIdExpiry,
            passportNumber,
            passportExpiry,
            address,
            state,
            city,
            zipCode,
            contactNumber,
            dialingCode,
            workType,
            industry,
            productTypeOffered,
            productOffered,
            companyName,
            positionInCompany
        } = req.body;
        
        // First, update the main persons table
        await connection.query(
            'UPDATE persons SET name = ?, identifiers = ?, country = ? WHERE id = ?',
            [fullName, nationalIdNumber, countryOfResidence, id]
        );
        
        // Store the edit in the edited_profiles table
        await connection.query(
            `INSERT INTO edited_profiles (
                profile_id,
                original_name,
                full_name,
                email,
                resident_status,
                gender,
                date_of_birth,
                nationality,
                country_of_residence,
                other_nationalities,
                specified_other_nationalities,
                national_id_number,
                national_id_expiry,
                passport_number,
                passport_expiry,
                address,
                state,
                city,
                zip_code,
                contact_number,
                dialing_code,
                work_type,
                industry,
                product_type_offered,
                product_offered,
                company_name,
                position_in_company,
                edited_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                originalName,
                fullName,
                email,
                residentStatus,
                gender,
                dateOfBirth,
                nationality,
                countryOfResidence,
                otherNationalities ? 1 : 0,
                specifiedOtherNationalities,
                nationalIdNumber,
                nationalIdExpiry,
                passportNumber,
                passportExpiry,
                address,
                state,
                city,
                zipCode,
                contactNumber,
                dialingCode,
                workType,
                industry,
                productTypeOffered,
                productOffered,
                companyName,
                positionInCompany,
                req.user.name || 'system'
            ]
        );
        
        // Check if there's an entry in individualob table
        const [existingIndividuals] = await connection.query(
            'SELECT * FROM individualob WHERE full_name = ?',
            [originalName]
        );
        
        if (existingIndividuals.length > 0) {
            // Update existing individualob record
            await connection.query(
                `UPDATE individualob SET 
                full_name = ?,
                email = ?,
                resident_status = ?,
                gender = ?,
                date_of_birth = ?,
                nationality = ?,
                country_of_residence = ?,
                other_nationalities = ?,
                specified_other_nationalities = ?,
                national_id_number = ?,
                national_id_expiry = ?,
                passport_number = ?,
                passport_expiry = ?,
                address = ?,
                state = ?,
                city = ?,
                zip_code = ?,
                contact_number = ?,
                dialing_code = ?,
                work_type = ?,
                industry = ?,
                product_type_offered = ?,
                product_offered = ?,
                company_name = ?,
                position_in_company = ?
                WHERE full_name = ?`,
                [
                    fullName,
                    email,
                    residentStatus,
                    gender,
                    dateOfBirth,
                    nationality,
                    countryOfResidence,
                    otherNationalities ? 1 : 0,
                    specifiedOtherNationalities,
                    nationalIdNumber,
                    nationalIdExpiry,
                    passportNumber,
                    passportExpiry,
                    address,
                    state,
                    city,
                    zipCode,
                    contactNumber,
                    dialingCode,
                    workType,
                    industry,
                    productTypeOffered,
                    productOffered,
                    companyName,
                    positionInCompany,
                    originalName
                ]
            );
        } else {
            // Insert new record in individualob table
            await connection.query(
                `INSERT INTO individualob (
                    full_name,
                    email,
                    resident_status,
                    gender,
                    date_of_birth,
                    nationality,
                    country_of_residence,
                    other_nationalities,
                    specified_other_nationalities,
                    national_id_number,
                    national_id_expiry,
                    passport_number,
                    passport_expiry,
                    address,
                    state,
                    city,
                    zip_code,
                    contact_number,
                    dialing_code,
                    work_type,
                    industry,
                    product_type_offered,
                    product_offered,
                    company_name,
                    position_in_company,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    fullName,
                    email,
                    residentStatus,
                    gender,
                    dateOfBirth,
                    nationality,
                    countryOfResidence,
                    otherNationalities ? 1 : 0,
                    specifiedOtherNationalities,
                    nationalIdNumber,
                    nationalIdExpiry,
                    passportNumber,
                    passportExpiry,
                    address,
                    state,
                    city,
                    zipCode,
                    contactNumber,
                    dialingCode,
                    workType,
                    industry,
                    productTypeOffered,
                    productOffered,
                    companyName,
                    positionInCompany,
                    'approved' // Set as approved since it's coming from edit
                ]
            );
        }
        
        await connection.commit();
        
        return res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    } finally {
        connection.release();
    }
});

module.exports = router; 