# Links API Documentation

## Overview
The Links API provides comprehensive functionality for managing links with features like categorization, priority levels, target audience filtering, scheduling, and various access controls.

## Base URL
```
http://localhost:3000/api/links
```

## Authentication
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

enum TargetAudience {
  all
  students
  admins
}

enum LinkPriority {
  normal
  highlight
}

enum OpenMode {
  newtab
  sametab
}
### Field Descriptions

### Link Fields
- **id**: Unique identifier (UUID)
- **title**: Link title (required, max 255 characters)
- **url**: Valid URL (required)
- **description**: Optional description (max 1000 characters)
- **category**: Optional category (max 100 characters)
- **priority**: Link priority (`normal` or `highlight`, default: `normal`)
- **icon**: Optional icon identifier (max 100 characters)
- **openMode**: How link opens (`newtab` or `sametab`, default: `newtab`)
- **isActive**: Whether link is active (boolean, default: `true`)
- **targetAudience**: Who can see the link (`all`, `students`, `admins`, default: `all`)
- **order**: Display order (integer, default: 0)
- **startDate**: Optional start date (ISO 8601 format)
- **endDate**: Optional end date (ISO 8601 format, must be after startDate)
- **viewCount**: Number of times the link has been viewed (integer, default: 0)
- **createdBy**: ID of user who created the link
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestampon
## Endpoints

### 1. Create Link
**POST** `/api/links`

**Access:** Admin, Super Admin only

**Request:**
```json
{
  "title": "University Portal",
  "url": "https://portal.university.edu",
  "description": "Main university portal for students and staff",
  "category": "Academic",
  "priority": "university",
  "openMode": "newtab",
  "isActive": true,
  "targetAudience": "all",
  "order": 1,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Link created successfully",
  "data": {
    "id": "uuid-here",
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": true,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "viewCount": 0,
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/links" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": true,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z"
  }'
```

---

### 2. Get All Links (Admin)
**GET** `/api/links`

**Access:** Admin, Super Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority (normal, highlight)
- `targetAudience` (optional): Filter by target audience (all, students, admins)
- `isActive` (optional): Filter by active status (true, false)
- `search` (optional): Search in title, description, category
- `sortBy` (optional): Sort field (title, order, createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)
- `includeExpired` (optional): Include expired links (true, false)
- `createdBy` (optional): Filter by creator ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "University Portal",
      "url": "https://portal.university.edu",
      "description": "Main university portal for students and staff",
      "category": "Academic",
      "priority": "highlight",
      "icon": "university",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "all",
      "order": 1,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "viewCount": 25,
      "createdBy": "admin-user-id",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdByUser": {
        "id": "admin-user-id",
        "username": "admin",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links?page=1&limit=10&category=Academic&priority=highlight&isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Active Links for User
**GET** `/api/links/active`

**Access:** All authenticated users

**Query Parameters:**
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority
- `sortBy` (optional): Sort field (default: order)
- `sortOrder` (optional): Sort order (default: asc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "Student Portal",
      "url": "https://student.university.edu",
      "description": "Student-specific portal",
      "category": "Academic",
      "priority": "normal",
      "icon": "student",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "students",
      "order": 1,
      "startDate": null,
      "endDate": null,
      "viewCount": 45,
      "createdBy": "admin-user-id",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdByUser": {
        "id": "admin-user-id",
        "username": "admin",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/active?category=Academic&sortBy=order" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Public Active Links
**GET** `/api/links/public/active`

**Access:** Public (no authentication required)

**Query Parameters:**
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority
- `sortBy` (optional): Sort field (default: order)
- `sortOrder` (optional): Sort order (default: asc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "University Website",
      "url": "https://www.university.edu",
      "description": "Official university website",
      "category": "Information",
      "priority": "highlight",
      "icon": "globe",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "all",
      "order": 1,
      "startDate": null,
      "endDate": null,
      "viewCount": 89,
      "createdBy": "admin-user-id",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdByUser": {
        "id": "admin-user-id",
        "username": "admin",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/public/active?priority=highlight"
```

---

### 5. Get Link by ID
**GET** `/api/links/:id`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": true,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/uuid-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Update Link
**PUT** `/api/links/:id`

**Access:** Admin, Super Admin only

**Request:**
```json
{
  "title": "Updated University Portal",
  "description": "Updated description",
  "priority": "normal",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Link updated successfully",
  "data": {
    "id": "uuid-here",
    "title": "Updated University Portal",
    "url": "https://portal.university.edu",
    "description": "Updated description",
    "category": "Academic",
    "priority": "normal",
    "icon": "university",
    "openMode": "newtab",
    "isActive": false,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X PUT "http://localhost:3000/api/links/uuid-here" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated University Portal",
    "description": "Updated description",
    "priority": "normal",
    "isActive": false
  }'
```

---

### 7. Delete Link
**DELETE** `/api/links/:id`

**Access:** Admin, Super Admin only

**Response:**
```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/links/uuid-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8. Toggle Link Status
**PATCH** `/api/links/:id/toggle-status`

**Access:** Admin, Super Admin only

**Response:**
```json
{
  "success": true,
  "message": "Link status toggled successfully",
  "data": {
    "id": "uuid-here",
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": false,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/links/uuid-here/toggle-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Duplicate Link
**POST** `/api/links/:id/duplicate`

**Access:** Admin, Super Admin only

**Response:**
```json
{
  "success": true,
  "message": "Link duplicated successfully",
  "data": {
    "id": "new-uuid-here",
    "title": "University Portal (Copy)",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": false,
    "targetAudience": "all",
    "order": 2,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T13:00:00.000Z",
    "updatedAt": "2024-01-01T13:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/links/uuid-here/duplicate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 10. Update Link Order
**PATCH** `/api/links/order`

**Access:** Admin, Super Admin only

**Request:**
```json
{
  "linkUpdates": [
    {
      "id": "uuid-1",
      "order": 1
    },
    {
      "id": "uuid-2",
      "order": 2
    },
    {
      "id": "uuid-3",
      "order": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Link orders updated successfully"
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/links/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "linkUpdates": [
      {
        "id": "uuid-1",
        "order": 1
      },
      {
        "id": "uuid-2",
        "order": 2
      },
      {
        "id": "uuid-3",
        "order": 3
      }
    ]
  }'
```

---

### 11. Get Link Categories
**GET** `/api/links/categories`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": [
    "Academic",
    "Administrative",
    "Library",
    "Student Services",
    "Research",
    "Events"
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/categories" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 12. Get Link Statistics
**GET** `/api/links/statistics`

**Access:** Admin, Super Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 42,
    "inactive": 8,
    "totalViews": 1250,
    "byPriority": {
      "normal": 35,
      "highlight": 15
    },
    "byTargetAudience": {
      "all": 20,
      "students": 25,
      "admins": 5
    },
    "byCategory": {
      "Academic": 20,
      "Administrative": 10,
      "Library": 8,
      "Student Services": 7,
      "Research": 3,
      "Events": 2
    }
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 13. Get User's Links
**GET** `/api/links/my-links`

**Access:** All authenticated users

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "My Custom Link",
      "url": "https://example.com",
      "description": "A link I created",
      "category": "Personal",
      "priority": "normal",
      "icon": "bookmark",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "all",
      "order": 1,
      "startDate": null,
      "endDate": null,
      "createdBy": "current-user-id",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdByUser": {
        "id": "current-user-id",
        "username": "currentuser",
        "firstName": "Current",
        "lastName": "User"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/my-links?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 14. Track Link View (Public)
**POST** `/api/links/public/:id/view`

**Access:** Public (no authentication required)

**Response:**
```json
{
  "success": true,
  "message": "Link view count incremented",
  "data": {
    "id": "uuid-here",
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": true,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "viewCount": 26,
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/links/public/uuid-here/view"
```

---

### 15. Track Link View (Authenticated)
**POST** `/api/links/:id/view`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "Link view count incremented",
  "data": {
    "id": "uuid-here",
    "title": "University Portal",
    "url": "https://portal.university.edu",
    "description": "Main university portal for students and staff",
    "category": "Academic",
    "priority": "highlight",
    "icon": "university",
    "openMode": "newtab",
    "isActive": true,
    "targetAudience": "all",
    "order": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "viewCount": 27,
    "createdBy": "admin-user-id",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "createdByUser": {
      "id": "admin-user-id",
      "username": "admin",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/links/uuid-here/view" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 16. Get Most Viewed Links
**GET** `/api/links/most-viewed`

**Access:** All authenticated users

**Query Parameters:**
- `limit` (optional): Number of links to return (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "Most Popular Link",
      "url": "https://popular.university.edu",
      "description": "The most clicked link",
      "category": "Popular",
      "priority": "highlight",
      "icon": "star",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "all",
      "order": 1,
      "startDate": null,
      "endDate": null,
      "viewCount": 150,
      "createdBy": "admin-user-id",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdByUser": {
        "id": "admin-user-id",
        "username": "admin",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    {
      "id": "uuid-here-2",
      "title": "Second Most Popular",
      "url": "https://second.university.edu",
      "description": "Second most clicked link",
      "category": "Academic",
      "priority": "normal",
      "icon": "book",
      "openMode": "newtab",
      "isActive": true,
      "targetAudience": "students",
      "order": 2,
      "startDate": null,
      "endDate": null,
      "viewCount": 120,
      "createdBy": "admin-user-id",
      "createdAt": "2024-01-01T11:00:00.000Z",
      "updatedAt": "2024-01-01T11:00:00.000Z",
      "createdByUser": {
        "id": "admin-user-id",
        "username": "admin",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/links/most-viewed?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 17. Bulk Update Links
**PATCH** `/api/links/bulk/update`

**Access:** Admin, Super Admin only

**Request:**
```json
{
  "linkIds": ["uuid-1", "uuid-2", "uuid-3"],
  "updateData": {
    "isActive": false,
    "category": "Archived"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed: 3 successful, 0 failed",
  "data": {
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "linkId": "uuid-1",
        "status": "fulfilled",
        "data": {
          "id": "uuid-1",
          "title": "Link 1",
          "isActive": false,
          "category": "Archived"
        },
        "error": null
      },
      {
        "linkId": "uuid-2",
        "status": "fulfilled",
        "data": {
          "id": "uuid-2",
          "title": "Link 2",
          "isActive": false,
          "category": "Archived"
        },
        "error": null
      },
      {
        "linkId": "uuid-3",
        "status": "fulfilled",
        "data": {
          "id": "uuid-3",
          "title": "Link 3",
          "isActive": false,
          "category": "Archived"
        },
        "error": null
      }
    ]
  }
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/links/bulk/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "linkIds": ["uuid-1", "uuid-2", "uuid-3"],
    "updateData": {
      "isActive": false,
      "category": "Archived"
    }
  }'
```

---

### 18. Bulk Delete Links
**DELETE** `/api/links/bulk/delete`

**Access:** Admin, Super Admin only

**Request:**
```json
{
  "linkIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk delete completed: 3 successful, 0 failed",
  "data": {
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "linkId": "uuid-1",
        "status": "fulfilled",
        "error": null
      },
      {
        "linkId": "uuid-2",
        "status": "fulfilled",
        "error": null
      },
      {
        "linkId": "uuid-3",
        "status": "fulfilled",
        "error": null
      }
    ]
  }
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/links/bulk/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "linkIds": ["uuid-1", "uuid-2", "uuid-3"]
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: Title is required, Valid URL is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Link not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Field Descriptions

### Link Fields
- **id**: Unique identifier (UUID)
- **title**: Link title (required, max 255 characters)
- **url**: Valid URL (required)
- **description**: Optional description (max 1000 characters)
- **category**: Optional category (max 100 characters)
- **priority**: Link priority (`normal` or `highlight`, default: `normal`)
- **icon**: Optional icon identifier (max 100 characters)
- **openMode**: How link opens (`newtab` or `sametab`, default: `newtab`)
- **isActive**: Whether link is active (boolean, default: `true`)
- **targetAudience**: Who can see the link (`all`, `students`, `admins`, default: `all`)
- **order**: Display order (integer, default: 0)
- **startDate**: Optional start date (ISO 8601 format)
- **endDate**: Optional end date (ISO 8601 format, must be after startDate)
- **createdBy**: ID of user who created the link
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

### Query Parameters
- **page**: Page number for pagination (min: 1)
- **limit**: Items per page (min: 1, max: 100)
- **sortBy**: Field to sort by (`title`, `order`, `createdAt`, `updatedAt`)
- **sortOrder**: Sort direction (`asc`, `desc`)
- **search**: Search term for title, description, category
- **category**: Filter by category
- **priority**: Filter by priority
- **targetAudience**: Filter by target audience
- **isActive**: Filter by active status
- **includeExpired**: Include expired links in results

---

## Notes

1. **Authentication**: Most endpoints require JWT authentication. Include the token in the `Authorization` header as `Bearer YOUR_TOKEN`.

2. **Permissions**: 
   - Admin and Super Admin can manage all links
   - Regular users can only view active links appropriate for their role
   - Public endpoints don't require authentication

3. **Date Handling**: 
   - Dates should be in ISO 8601 format
   - Links with startDate in the future or endDate in the past are considered inactive
   - Both startDate and endDate are optional

4. **Target Audience Logic**:
   - `all`: Visible to everyone
   - `students`: Only visible to users with role 'student'
   - `admins`: Only visible to users with roles 'admin' or 'super_admin'

5. **View Tracking**:
   - View counts are automatically incremented when using view tracking endpoints
   - Public view tracking doesn't require authentication for external website integration
   - View counts are atomic and thread-safe
   - View statistics are included in the enhanced statistics endpoint

6. **Pagination**: Use `page` and `limit` parameters for pagination. Response includes pagination metadata.

7. **Bulk Operations**: Allow operating on multiple links simultaneously with detailed success/failure reporting.

8. **Validation**: All inputs are validated with detailed error messages returned for invalid data.

9. **Performance**: 
   - Links are efficiently filtered and sorted at the database level
   - Most viewed links are optimized for quick retrieval
   - View count updates use database-level increment operations