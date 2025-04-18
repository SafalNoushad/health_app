# Health App API Documentation

This document provides comprehensive information about all API endpoints available in the Health App backend system. The documentation is organized by resource type and includes details about request methods, URL paths, required parameters, authentication requirements, and response formats.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Doctors](#doctors)
4. [Hospitals](#hospitals)
5. [Appointments](#appointments)
6. [Health Conditions](#health-conditions)
7. [Chatbot](#chatbot)
8. [RFID Cards](#rfid-cards)

## Authentication

Endpoints for user registration and authentication.

### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Description**: Register a new user in the system
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient",  // Options: patient, doctor, admin
    "phone": "1234567890",  // Optional
    "address": "123 Main St",  // Optional
    "speciality": "Cardiology",  // Required for doctors
    "hospitalId": "60d21b4667d0d8992e610c85"  // Required for doctors
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "phone": "1234567890",
      "address": "123 Main St"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input or user already exists
  - `500`: Server error

### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Description**: Authenticate a user and get access token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid credentials
  - `500`: Server error

## Users

Endpoints for user management.

### Get All Users

- **URL**: `/api/users`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Get a list of all users in the system
- **Response (200)**:
  ```json
  {
    "success": true,
    "users": [
      {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "patient"
      },
      // More users...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized as admin
  - `500`: Server error

### Get User by ID

- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Authentication**: Required (Admin or own user)
- **Description**: Get details of a specific user
- **URL Parameters**: `id` - User ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "phone": "1234567890",
      "address": "123 Main St"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized
  - `404`: User not found
  - `500`: Server error

### Update User

- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Authentication**: Required (Admin or own user)
- **Description**: Update user information
- **URL Parameters**: `id` - User ID
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "9876543210",
    "address": "456 Oak St",
    "speciality": "Neurology",  // Only for doctors
    "hospitalId": "60d21b4667d0d8992e610c87"  // Only for doctors
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "role": "patient",
      "phone": "9876543210",
      "address": "456 Oak St"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized
  - `404`: User not found
  - `500`: Server error

## Doctors

Endpoints for doctor management and information.

### Get All Doctors

- **URL**: `/api/doctors`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of all doctors
- **Response (200)**:
  ```json
  {
    "success": true,
    "doctors": [
      {
        "_id": "60d21b4667d0d8992e610c88",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com",
        "role": "doctor",
        "speciality": "Cardiology",
        "hospitalId": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "General Hospital",
          "address": "789 Hospital Ave"
        }
      },
      // More doctors...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get Doctors by Speciality

- **URL**: `/api/doctors/speciality/:speciality`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of doctors with a specific speciality
- **URL Parameters**: `speciality` - Doctor speciality
- **Response (200)**:
  ```json
  {
    "success": true,
    "doctors": [
      {
        "_id": "60d21b4667d0d8992e610c88",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com",
        "role": "doctor",
        "speciality": "Cardiology",
        "hospitalId": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "General Hospital",
          "address": "789 Hospital Ave"
        }
      },
      // More doctors with the same speciality...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get All Specialities

- **URL**: `/api/doctors/specialities/all`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of all available doctor specialities
- **Response (200)**:
  ```json
  {
    "success": true,
    "specialities": ["Cardiology", "Neurology", "Pediatrics", "Dermatology"]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get Doctor by ID

- **URL**: `/api/doctors/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get details of a specific doctor
- **URL Parameters**: `id` - Doctor ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "doctor": {
      "_id": "60d21b4667d0d8992e610c88",
      "name": "Dr. Jane Smith",
      "email": "jane@example.com",
      "role": "doctor",
      "speciality": "Cardiology",
      "hospitalId": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "General Hospital",
        "address": "789 Hospital Ave"
      }
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `404`: Doctor not found
  - `500`: Server error

## Hospitals

Endpoints for hospital management.

### Create Hospital

- **URL**: `/api/hospitals`
- **Method**: `POST`
- **Authentication**: Required (Admin only)
- **Description**: Create a new hospital
- **Request Body**:
  ```json
  {
    "name": "General Hospital",
    "address": "789 Hospital Ave",
    "phone": "1234567890",
    "email": "info@hospital.com",
    "website": "www.hospital.com"
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Hospital created successfully",
    "hospital": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "General Hospital",
      "address": "789 Hospital Ave",
      "phone": "1234567890",
      "email": "info@hospital.com",
      "website": "www.hospital.com"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input
  - `401`: Not authenticated
  - `403`: Not authorized as admin
  - `500`: Server error

### Get All Hospitals

- **URL**: `/api/hospitals`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of all hospitals
- **Response (200)**:
  ```json
  {
    "success": true,
    "hospitals": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "General Hospital",
        "address": "789 Hospital Ave",
        "phone": "1234567890",
        "email": "info@hospital.com",
        "website": "www.hospital.com"
      },
      // More hospitals...
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error

### Get Hospital by ID

- **URL**: `/api/hospitals/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get details of a specific hospital
- **URL Parameters**: `id` - Hospital ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "hospital": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "General Hospital",
      "address": "789 Hospital Ave",
      "phone": "1234567890",
      "email": "info@hospital.com",
      "website": "www.hospital.com"
    }
  }
  ```
- **Error Responses**:
  - `404`: Hospital not found
  - `500`: Server error

## Appointments

Endpoints for appointment management.

### Create Appointment

- **URL**: `/api/appointments`
- **Method**: `POST`
- **Authentication**: Required (Patient only)
- **Description**: Create a new appointment
- **Request Body**:
  ```json
  {
    "doctorId": "60d21b4667d0d8992e610c88",
    "date": "2023-07-15",
    "time": "10:00 AM",
    "hospitalId": "60d21b4667d0d8992e610c85",
    "notes": "Regular checkup"  // Optional
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "appointment": {
      "_id": "60d21b4667d0d8992e610c89",
      "doctorId": "60d21b4667d0d8992e610c88",
      "doctorName": "Dr. Jane Smith",
      "patientId": "60d21b4667d0d8992e610c86",
      "speciality": "Cardiology",
      "date": "2023-07-15",
      "time": "10:00 AM",
      "status": "pending",
      "hospitalId": "60d21b4667d0d8992e610c85",
      "notes": "Regular checkup"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input
  - `401`: Not authenticated
  - `403`: Not authorized as patient
  - `500`: Server error

### Get All Appointments

- **URL**: `/api/appointments`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of appointments (filtered by user role)
- **Response (200)**:
  ```json
  {
    "success": true,
    "appointments": [
      {
        "_id": "60d21b4667d0d8992e610c89",
        "doctorId": "60d21b4667d0d8992e610c88",
        "doctorName": "Dr. Jane Smith",
        "patientId": {
          "_id": "60d21b4667d0d8992e610c86",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "speciality": "Cardiology",
        "date": "2023-07-15",
        "time": "10:00 AM",
        "status": "pending",
        "hospitalId": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "General Hospital",
          "address": "789 Hospital Ave"
        },
        "notes": "Regular checkup"
      },
      // More appointments...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get Appointment by ID

- **URL**: `/api/appointments/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get details of a specific appointment
- **URL Parameters**: `id` - Appointment ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "appointment": {
      "_id": "60d21b4667d0d8992e610c89",
      "doctorId": "60d21b4667d0d8992e610c88",
      "doctorName": "Dr. Jane Smith",
      "patientId": {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "speciality": "Cardiology",
      "date": "2023-07-15",
      "time": "10:00 AM",
      "status": "pending",
      "hospitalId": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "General Hospital",
        "address": "789 Hospital Ave"
      },
      "notes": "Regular checkup"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized
  - `404`: Appointment not found
  - `500`: Server error

## Health Conditions

Endpoints for managing patient health conditions and medical documents.

### Create/Update Health Conditions

- **URL**: `/api/health`
- **Method**: `POST`
- **Authentication**: Required (Patient only)
- **Description**: Create or update health conditions for a patient
- **Request Body**:
  ```json
  {
    "diabetes": false,
    "hypertension": true,
    "asthma": false,
    "heartDisease": false,
    "arthritis": true,
    "chronicKidneyDisease": false,
    "thyroidDisorders": false
  }
  ```
- **Response (200/201)**:
  ```json
  {
    "success": true,
    "message": "Health conditions updated successfully",
    "healthCondition": {
      "_id": "60d21b4667d0d8992e610c90",
      "userId": "60d21b4667d0d8992e610c86",
      "diabetes": false,
      "hypertension": true,
      "asthma": false,
      "heartDisease": false,
      "arthritis": true,
      "chronicKidneyDisease": false,
      "thyroidDisorders": false
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized as patient
  - `500`: Server error

### Get Health Conditions

- **URL**: `/api/health`
- **Method**: `GET`
- **Authentication**: Required (Patient or Doctor)
- **Description**: Get health conditions for the authenticated patient or a specific patient (for doctors)
- **Response (200)**:
  ```json
  {
    "success": true,
    "healthCondition": {
      "_id": "60d21b4667d0d8992e610c90",
      "userId": "60d21b4667d0d8992e610c86",
      "diabetes": false,
      "hypertension": true,
      "asthma": false,
      "heartDisease": false,
      "arthritis": true,
      "chronicKidneyDisease": false,
      "thyroidDisorders": false
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized
  - `404`: Health conditions not found
  - `500`: Server error

### Upload Medical Document

- **URL**: `/api/health/documents`
- **Method**: `POST`
- **Authentication**: Required (Patient only)
- **Description**: Upload a medical document (PDF only)
- **Request Body**: Form data with:
  - `document`: PDF file (max 10MB)
  - `title`: Document title
  - `description`: Document description (optional)
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Document uploaded successfully",
    "document": {
      "_id": "60d21b4667d0d8992e610c91",
      "userId": "60d21b4667d0d8992e610c86",
      "title": "Blood Test Results",
      "description": "Annual blood work",
      "filePath": "/uploads/1623456789-blood_test.pdf",
      "uploadDate": "2023-06-12T10:30:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid file type or size
  - `401`: Not authenticated
  - `403`: Not authorized as patient
  - `500`: Server error

## Chatbot

Endpoints for the health assistant chatbot.

### Send Message to Chatbot

- **URL**: `/api/chatbot`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Send a message to the health assistant chatbot
- **Request Body**:
  ```json
  {
    "message": "What are the symptoms of diabetes?",
    "conversationId": "60d21b4667d0d8992e610c92"  // Optional, for continuing an existing conversation
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Diabetes symptoms may include increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, irritability, blurred vision, slow-healing sores, and frequent infections. It's important to consult with a healthcare professional if you experience these symptoms as early diagnosis and treatment can prevent complications.",
      "conversationId": "60d21b4667d0d8992e610c92"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get Conversation History

- **URL**: `/api/chatbot/conversations`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get a list of the user's chat conversations
- **Response (200)**:
  ```json
  {
    "success": true,
    "conversations": [
      {
        "_id": "60d21b4667d0d8992e610c92",
        "title": "What are the symptoms of diabetes?",
        "createdAt": "2023-06-15T14:30:00.000Z",
        "updatedAt": "2023-06-15T14:35:00.000Z"
      },
      {
        "_id": "60d21b4667d0d8992e610c93",
        "title": "How to manage hypertension?",
        "createdAt": "2023-06-14T10:15:00.000Z",
        "updatedAt": "2023-06-14T10:20:00.000Z"
      }
      // More conversations...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `500`: Server error

### Get Specific Conversation

- **URL**: `/api/chatbot/conversations/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get details of a specific conversation including all messages
- **URL Parameters**: `id` - Conversation ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "conversation": {
      "_id": "60d21b4667d0d8992e610c92",
      "title": "What are the symptoms of diabetes?",
      "userId": "60d21b4667d0d8992e610c86",
      "messages": [
        {
          "role": "user",
          "content": "What are the symptoms of diabetes?",
          "timestamp": "2023-06-15T14:30:00.000Z"
        },
        {
          "role": "assistant",
          "content": "Diabetes symptoms may include increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, irritability, blurred vision, slow-healing sores, and frequent infections. It's important to consult with a healthcare professional if you experience these symptoms as early diagnosis and treatment can prevent complications.",
          "timestamp": "2023-06-15T14:30:05.000Z"
        },
        // More messages in the conversation...
      ],
      "createdAt": "2023-06-15T14:30:00.000Z",
      "updatedAt": "2023-06-15T14:35:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `404`: Conversation not found
  - `500`: Server error

### Delete Conversation

- **URL**: `/api/chatbot/conversations/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Description**: Delete a specific conversation (soft delete)
- **URL Parameters**: `id` - Conversation ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Conversation deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `404`: Conversation not found
  - `500`: Server error

### Send Specialized Health Query

- **URL**: `/api/chatbot/health-query`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Send a specialized health-related query using predefined templates
- **Request Body**:
  ```json
  {
    "queryType": "symptoms",  // Options: symptoms, medication, prevention, nutrition, exercise
    "specificQuery": "diabetes",  // Optional, specific condition or topic
    "conversationId": "60d21b4667d0d8992e610c92"  // Optional, for continuing an existing conversation
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Common symptoms of diabetes include increased thirst (polydipsia), frequent urination (polyuria), extreme hunger (polyphagia), unexplained weight loss, fatigue, irritability, blurred vision, slow-healing sores, and frequent infections. Early warning signs may include tingling or numbness in the hands or feet, recurring skin, gum, or bladder infections, and cuts/bruises that are slow to heal. You should see a doctor if you experience any combination of these symptoms, especially increased thirst and urination accompanied by unexplained weight loss. Early diagnosis is crucial as untreated diabetes can lead to serious complications including heart disease, kidney damage, nerve damage, and vision problems.",
      "conversationId": "60d21b4667d0d8992e610c92"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid query type
  - `401`: Not authenticated
  - `500`: Server error

---

## Authentication and Security

### JWT Authentication

Most endpoints require authentication using a JWT token. To authenticate:

1. Obtain a token by logging in via `/api/auth/login`
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

### Role-Based Access Control

The API implements role-based access control with three roles:

- **Patient**: Can manage their own profile, appointments, health conditions, and documents
- **Doctor**: Can view assigned appointments, patient information, and health conditions
- **Admin**: Has full access to all resources and can manage hospitals and users

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Resource created
- `400`: Bad request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Resource not found
- `500`: Server error

## RFID Cards

Endpoints for managing RFID cards assigned to patients.

### Assign RFID Card to Patient

- **URL**: `/api/rfid/assign`
- **Method**: `POST`
- **Authentication**: Required (Admin or Doctor only)
- **Description**: Assign an RFID card to a patient
- **Request Body**:
  ```json
  {
    "rfidNumber": "RFID-100001",
    "userId": "60d21b4667d0d8992e610c86"
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "RFID card assigned successfully",
    "rfid": {
      "_id": "60d21b4667d0d8992e610c87",
      "rfidNumber": "RFID-100001",
      "userId": "60d21b4667d0d8992e610c86",
      "isActive": true,
      "assignedBy": "60d21b4667d0d8992e610c85",
      "createdAt": "2023-06-22T15:30:45.123Z",
      "updatedAt": "2023-06-22T15:30:45.123Z"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input or RFID already assigned
  - `401`: Not authenticated
  - `403`: Not authorized (not admin or doctor)
  - `404`: User not found
  - `500`: Server error

### Get User by RFID Number

- **URL**: `/api/rfid/user/:rfidNumber`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get user details associated with an RFID card
- **URL Parameters**: `rfidNumber` - RFID card number
- **Response (200)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient",
      "phone": "1234567890",
      "address": "123 Main St"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `404`: RFID card or user not found
  - `500`: Server error

### Get All RFID Assignments

- **URL**: `/api/rfid`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Get a list of all RFID card assignments
- **Response (200)**:
  ```json
  {
    "success": true,
    "rfids": [
      {
        "_id": "60d21b4667d0d8992e610c87",
        "rfidNumber": "RFID-100001",
        "userId": {
          "_id": "60d21b4667d0d8992e610c86",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "isActive": true,
        "assignedBy": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2023-06-22T15:30:45.123Z",
        "updatedAt": "2023-06-22T15:30:45.123Z"
      },
      // More RFID assignments...
    ]
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized (not admin)
  - `500`: Server error

### Get RFID Assignment by ID

- **URL**: `/api/rfid/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get details of a specific RFID assignment
- **URL Parameters**: `id` - RFID assignment ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "rfid": {
      "_id": "60d21b4667d0d8992e610c87",
      "rfidNumber": "RFID-100001",
      "userId": {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "isActive": true,
      "assignedBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-06-22T15:30:45.123Z",
      "updatedAt": "2023-06-22T15:30:45.123Z"
    }
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `404`: RFID assignment not found
  - `500`: Server error

### Update RFID Assignment

- **URL**: `/api/rfid/:id`
- **Method**: `PUT`
- **Authentication**: Required (Admin or Doctor only)
- **Description**: Update an RFID assignment
- **URL Parameters**: `id` - RFID assignment ID
- **Request Body**:
  ```json
  {
    "rfidNumber": "RFID-100002",
    "userId": "60d21b4667d0d8992e610c88",
    "isActive": false
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "RFID assignment updated successfully",
    "rfid": {
      "_id": "60d21b4667d0d8992e610c87",
      "rfidNumber": "RFID-100002",
      "userId": "60d21b4667d0d8992e610c88",
      "isActive": false,
      "assignedBy": "60d21b4667d0d8992e610c85",
      "createdAt": "2023-06-22T15:30:45.123Z",
      "updatedAt": "2023-06-22T16:45:12.456Z"
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input or RFID number already in use
  - `401`: Not authenticated
  - `403`: Not authorized (not admin or doctor)
  - `404`: RFID assignment or user not found
  - `500`: Server error

### Delete RFID Assignment

- **URL**: `/api/rfid/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Admin only)
- **Description**: Delete an RFID assignment
- **URL Parameters**: `id` - RFID assignment ID
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "RFID assignment deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized (not admin)
  - `404`: RFID assignment not found
  - `500`: Server error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. Excessive requests may result in temporary blocking.

## Data Models

The API uses the following main data models:

- **User**: Represents patients, doctors, and administrators
- **Hospital**: Represents medical facilities
- **Appointment**: Represents scheduled appointments between patients and doctors
- **HealthCondition**: Represents patient health conditions and medical history
- **Document**: Represents uploaded medical documents
- **Conversation**: Represents chat conversations between users and the health assistant chatbot
- **RFID**: Represents RFID cards assigned to patients

## API Versioning

The current API version is v1, which is implicit in all endpoints. Future versions will be explicitly versioned in the URL path.