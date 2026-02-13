# Restaurant Map — API Reference

Base URL: `http://localhost:8000/api/v1`

All responses follow the format:
```json
{ "data": { ... } }          // single resource
{ "data": [...], "meta": { "current_page":1, "last_page":2, "per_page":15, "total":30 }, "links": {...} }  // paginated
{ "message": "..." }         // action result / error
```

---

## Authentication

### POST `/auth/login`
Authenticate as admin. Sets an **HTTP-only cookie** `access_token` with JWT.
The token is **never returned in the response body** (XSS-safe).

**Request**
```json
{ "email": "admin@restaurant-map.com", "password": "password" }
```

**Response `200`**
```json
{
  "message": "Authenticated.",
  "user": { "id": 1, "name": "Super Admin", "email": "admin@restaurant-map.com" }
}
```
`Set-Cookie: access_token=<JWT>; HttpOnly; Path=/api; SameSite=Lax`

**Error `401`** — Invalid credentials

---

### POST `/admin/auth/logout` 🔒
Invalidates the JWT and clears the cookie.

**Response `200`**
```json
{ "message": "Logged out successfully." }
```
`Set-Cookie: access_token=; Max-Age=-1; ...` *(cleared)*

---

### POST `/admin/auth/refresh` 🔒
Issues a new JWT (token rotation), resets cookie TTL.

**Response `200`** — Same structure as login (new cookie set)

---

### GET `/admin/auth/me` 🔒
Returns the currently authenticated user.

**Response `200`**
```json
{ "id": 1, "name": "Super Admin", "email": "admin@restaurant-map.com" }
```

---

## Categories (Public)

### GET `/categories`
Returns all **active** categories, ordered by `sort_order`.

**Response `200`**
```json
{
  "data": [
    { "id": 1, "name": "Vietnamese", "slug": "vietnamese", "icon": "🍜", "color": "#E53E3E", "description": null, "sort_order": 0, "is_active": true }
  ]
}
```

### GET `/categories/{id}`

**Response `200`** — Single `CategoryResource`

---

## Categories (Admin) 🔒

### GET `/admin/categories`
Paginated list.

| Query param | Type    | Description                        |
|-------------|---------|------------------------------------|
| `page`      | integer | Page number (default: 1)           |
| `per_page`  | integer | Items per page (default: 15)       |
| `search`    | string  | Filter by name                     |
| `is_active` | boolean | Filter by active status            |

**Response `200`** — `PaginatedResponse<CategoryResource>`
Each item includes `restaurants_count`.

### POST `/admin/categories`
**Body**
```json
{
  "name": "Mediterranean",
  "icon": "🫒",
  "color": "#38A169",
  "description": "Optional",
  "sort_order": 5,
  "is_active": true
}
```
**Response `201`** — `CategoryResource`

### GET `/admin/categories/{id}`
**Response `200`** — `CategoryResource`

### PUT `/admin/categories/{id}`
Partial update — only send fields to change.
**Response `200`** — Updated `CategoryResource`

### DELETE `/admin/categories/{id}`
Soft-delete. **Fails `422`** if the category has restaurants.
**Response `200`**
```json
{ "message": "Category deleted." }
```

---

## Restaurants (Public)

### GET `/restaurants`
Paginated list for the sidebar.

| Query param  | Type           | Description                          |
|--------------|----------------|--------------------------------------|
| `page`       | integer        | Page number                          |
| `per_page`   | integer        | Default 15                           |
| `search`     | string         | Full-text search (name, address)     |
| `category_id`| integer/array  | Filter by category `?category_id[]=1&category_id[]=2` |
| `price_range`| integer/array  | Filter 1–4                           |
| `is_featured`| boolean        | Featured only                        |

**Response `200`** — `PaginatedResponse<RestaurantResource>`

---

### GET `/restaurants/map`
**Lightweight markers** for the map view — no pagination, minimal fields.

| Query param   | Type    | Description                          |
|---------------|---------|--------------------------------------|
| `sw_lat`      | float   | Southwest bound latitude             |
| `sw_lng`      | float   | Southwest bound longitude            |
| `ne_lat`      | float   | Northeast bound latitude             |
| `ne_lng`      | float   | Northeast bound longitude            |
| `category_id[]` | integer | Filter by category                 |
| `search`      | string  | Name search                          |

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Phở Hùng",
      "slug": "pho-hung",
      "address": "3 Pasteur, District 1",
      "latitude": 10.77564,
      "longitude": 106.70508,
      "price_range": 1,
      "capacity": 80,
      "tables": 20,
      "rating": 4.5,
      "rating_count": 324,
      "is_featured": true,
      "category": { "id": 1, "name": "Vietnamese", "icon": "🍜", "color": "#E53E3E" },
      "primary_image": { "url": "http://localhost:8000/storage/restaurants/abc123.jpg" },
      "images": [
        {
          "id": 1,
          "url": "http://localhost:8000/storage/restaurants/abc123.jpg",
          "is_primary": true,
          "sort_order": 0
        },
        {
          "id": 2,
          "url": "http://localhost:8000/storage/restaurants/xyz789.jpg",
          "is_primary": false,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

---

### GET `/restaurants/{slug}`
Full detail by slug.

**Response `200`**
```json
{
  "data": {
    "id": 1,
    "name": "Phở Hùng",
    "slug": "pho-hung",
    "description": "...",
    "address": "3 Pasteur, District 1",
    "city": "Ho Chi Minh City",
    "district": "District 1",
    "latitude": 10.77564,
    "longitude": 106.70508,
    "phone": "028 3822 2888",
    "website": null,
    "email": null,
    "opening_hours": { "mon": "07:00-22:00", "tue": "07:00-22:00", "wed": "07:00-22:00", "thu": "07:00-22:00", "fri": "07:00-23:00", "sat": "07:00-23:00", "sun": "08:00-22:00" },
    "price_range": 1,
    "price_range_label": "$",
    "capacity": 80,
    "tables": 20,
    "rating": 4.5,
    "rating_count": 324,
    "is_featured": true,
    "category": { "id": 1, "name": "Vietnamese", "slug": "vietnamese", "icon": "🍜", "color": "#E53E3E" },
    "images": [
      {
        "id": 1,
        "url": "http://localhost:8000/storage/restaurants/abc123.jpg",
        "caption": "Delicious Pho",
        "is_primary": true,
        "sort_order": 0
      },
      {
        "id": 2,
        "url": "http://localhost:8000/storage/restaurants/xyz789.jpg",
        "caption": null,
        "is_primary": false,
        "sort_order": 1
      }
    ],
    "created_at": "2024-01-01T00:00:00+00:00",
    "updated_at": "2024-01-01T00:00:00+00:00"
  }
}
```

---

## Restaurants (Admin) 🔒

### GET `/admin/restaurants`
Same filters as public + `is_active`, `with_trashed`.

### POST `/admin/restaurants`
```json
{
  "category_id": 1,
  "name": "My Restaurant",
  "address": "123 Test Street, District 1, Ho Chi Minh City",
  "city": "Ho Chi Minh City",
  "district": "District 1",
  "latitude": 10.7756,
  "longitude": 106.7019,
  "phone": "028 1234 5678",
  "website": "https://example.com",
  "email": "contact@example.com",
  "description": "Delicious food.",
  "opening_hours": { "mon": "08:00-22:00", "sun": "09:00-21:00" },
  "price_range": 2,
  "capacity": 100,
  "tables": 25,
  "is_active": true,
  "is_featured": false
}
```
**Response `201`** — `RestaurantDetailResource`

### GET `/admin/restaurants/{id}`
**Response `200`** — Full `RestaurantDetailResource` (includes images array)

### PUT `/admin/restaurants/{id}`
Partial update. **Response `200`** — Updated `RestaurantDetailResource`

### DELETE `/admin/restaurants/{id}`
Soft-delete + removes images from storage.
**Response `200`** `{ "message": "Restaurant deleted." }`

---

## Restaurant Images (Admin) 🔒

### POST `/admin/restaurants/{id}/images`
Upload an image. `multipart/form-data`.

| Field       | Type    | Description                         |
|-------------|---------|-------------------------------------|
| `image`     | file    | JPEG/PNG/WebP, max 5 MB (**required**) |
| `is_primary`| boolean | Set as primary image                |
| `caption`   | string  | Optional caption                    |

**Response `201`**
```json
{
  "data": {
    "id": 5,
    "url": "http://localhost:8000/storage/restaurants/abc123.jpg",
    "caption": null,
    "is_primary": true,
    "sort_order": 0,
    "created_at": "2024-02-13T10:30:00+00:00",
    "updated_at": "2024-02-13T10:30:00+00:00"
  }
}
```

**Image Processing:**
- Stored in `storage/app/public/restaurants/`
- URL accessible via `APP_URL/storage/restaurants/{filename}`
- Filename is generated using UUID to avoid conflicts
- If `is_primary` is true, all other images are set to `is_primary: false`

**Error `422`** — Validation errors:
```json
{
  "message": "The image field is required.",
  "errors": {
    "image": ["The image field is required."],
    "image": ["The image must be a file of type: jpeg, png, jpg, gif, webp."],
    "image": ["The image may not be greater than 5120 kilobytes."]
  }
}
```

### DELETE `/admin/restaurants/{id}/images/{imageId}`
Deletes image from storage and DB.

**Response `200`**
```json
{ "message": "Image deleted." }
```

**Error `404`** — Image not found or doesn't belong to restaurant

### PATCH `/admin/restaurants/{id}/images/reorder`
Reorder images by providing array of image IDs.

**Request**
```json
{ "image_ids": [3, 1, 4, 2] }
```

**Response `200`**
```json
{ "message": "Images reordered." }
```

**Note:** Images will be assigned `sort_order` values 0, 1, 2, 3 based on array position.

**Error `422`** — Validation error if image IDs don't belong to restaurant

---

## Admin Dashboard 🔒

### GET `/admin/dashboard`
```json
{
  "stats": {
    "total_restaurants": 42,
    "active_restaurants": 38,
    "featured_restaurants": 8,
    "total_categories": 10,
    "total_images": 96
  },
  "recent_restaurants": [
    { "id": 42, "name": "New Place", "category": "Vietnamese", "is_active": true, "created_at": "..." }
  ]
}
```

---

## Ratings (Public)

### GET `/restaurants/{restaurantId}/ratings`
Returns ratings for a specific restaurant, paginated.

| Query param | Type    | Description                        |
|-------------|---------|-------------------------------------|
| `page`      | integer | Page number (default: 1)            |
| `per_page`  | integer | Items per page (default: 15)        |

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "user_name": "John Doe",
      "rating": 5,
      "comment": "Excellent food and service!",
      "created_at": "2024-02-13T10:30:00+00:00"
    }
  ],
  "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 67 }
}
```

### POST `/restaurants/{restaurantId}/ratings`
Submit a rating (can be authenticated or anonymous).

**Request**
```json
{
  "rating": 5,
  "comment": "Great experience!",
  "user_name": "Jane Smith",
  "user_email": "jane@example.com"
}
```

| Field       | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `rating`    | integer | ✓        | 1-5 stars                            |
| `comment`   | string  |          | Review comment (max 1000 chars)      |
| `user_name` | string  | ✓*       | Required if not authenticated        |
| `user_email`| string  | ✓*       | Required if not authenticated        |

*If user is authenticated, `user_name` and `user_email` are ignored; the user's info is used.

**Response `201`**
```json
{
  "message": "Rating submitted successfully.",
  "data": {
    "id": 123,
    "user_name": "Jane Smith",
    "rating": 5,
    "comment": "Great experience!",
    "created_at": "2024-02-13T10:45:00+00:00"
  }
}
```

**Error `422`** — Validation error (duplicate rating from same IP/user within 24h)

---

## Ratings (Admin) 🔒

### GET `/admin/ratings`
View all ratings across all restaurants.

| Query param    | Type    | Description                        |
|----------------|---------|-------------------------------------|
| `page`         | integer | Page number                         |
| `per_page`     | integer | Default 15                          |
| `restaurant_id`| integer | Filter by restaurant                |
| `min_rating`   | integer | Minimum rating (1-5)                |
| `max_rating`   | integer | Maximum rating (1-5)                |

**Response `200`** — `PaginatedResponse<RatingResource>`

### DELETE `/admin/ratings/{id}`
Delete a rating (moderation).

**Response `200`**
```json
{ "message": "Rating deleted." }
```

---

## Error Responses

| Status | Meaning                         |
|--------|---------------------------------|
| `400`  | Bad request                     |
| `401`  | Unauthenticated (missing/expired cookie) |
| `404`  | Resource not found              |
| `422`  | Validation error / domain rule  |
| `500`  | Server error                    |

**Validation error format:**
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."],
    "latitude": ["The latitude field must be between -90 and 90."]
  }
}
```

---

## Frontend Integration Notes

1. **Auth cookie is automatic** — the browser sends it on every request.
   Frontend only needs `withCredentials: true` (Axios) or `credentials: 'include'` (fetch).

2. **Public endpoints** (categories, restaurants, map) — no auth needed, no cookie required.

3. **Map optimization** — call `/restaurants/map` with viewport bounds to fetch only visible markers. Debounce on `moveend`.

4. **Token refresh** — call `POST /admin/auth/refresh` before the JWT expires (default TTL: 24h from `config/jwt.php`).

5. **CORS** — ensure `config/cors.php` has `supports_credentials: true` and the frontend origin is in `allowed_origins`.
