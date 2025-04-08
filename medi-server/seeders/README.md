# Database Seeder for Medi-Server

This directory contains scripts to seed the MongoDB database with initial data for development and testing purposes.

## Available Scripts

### seed.js

The main seeder script that populates the database with sample data for hospitals, users (admins, doctors, patients), and appointments.

## Usage

To use the seeder script, run one of the following commands from the project root directory:

```bash
# Seed all collections (hospitals, users, appointments)
node seeders/seed.js --all

# Seed only specific collections
node seeders/seed.js --hospitals
node seeders/seed.js --users
node seeders/seed.js --appointments

# Seed multiple specific collections
node seeders/seed.js --hospitals --users
```

## Generated Data

The seeder creates the following data:

### Hospitals
- 3 sample hospitals with names, addresses, and contact information

### Users
- 1 admin user (email: admin@example.com, password: password123)
- 9 doctors (3 per hospital) with different specialities
- 10 patients

### Appointments
- 20 appointments (2 per patient) with random doctors, dates, times, and statuses

## Notes

- All passwords are set to 'password123' for testing purposes
- Running the seeder will delete all existing data in the specified collections
- Collections are seeded in order (hospitals → users → appointments) to maintain proper relationships
- When seeding specific collections, make sure to seed their dependencies first (e.g., seed hospitals before users)