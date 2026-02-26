# Test Register Society API in Thunder Client

## 1. Import the request (optional)

- Open Thunder Client in VS Code/Cursor.
- **Collections** → **Menu** → **Import** → choose `.thunderclient/Register Society API.json`.

## 2. Or create the request manually

- **New Request**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/v1/auth/register-society`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:** Raw, JSON:

```json
{
  "society_name": "My Housing Society",
  "address": "123 Main Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "contact_email": "society@example.com",
  "contact_phone": "9876543210",
  "registration_number": "REG123",
  "society_type": "cooperative_housing",
  "registration_year": "2024",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "full_name": "Society Admin",
  "phone": "9876543210"
}
```

## 3. Run the request

- Ensure the backend is running: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Click **Send**.

## 4. Expected response

- **200 OK** with JSON like:
  - `user`: id, email, full_name, roles, society_id, etc.
  - `society`: id, slug, name
  - `access_token`, `token_type`

## 5. If you get an error

- **400 "Email or society code already in use"**  
  Change `email` and/or `society_name` (slug is derived from society name) and try again.

- **422 "Validation error..."**  
  Check the `detail` and `errors` in the response. Required fields: `society_name`, `contact_email`, `email`, `password`, `full_name`. Use valid emails.

- **500 "Database schema may be outdated"**  
  Delete or rename `backend/vms.db` and restart the server so tables are recreated (or run with the migration that adds missing columns).

## 6. Run all APIs (including register-society) from terminal

From the `backend` folder:

```bash
python test_all_apis.py
```

This calls register-society with a unique email first, then the rest of the APIs.
