# Setup Autentikasi Admin dengan Supabase

## 📋 Deskripsi

Sistem autentikasi admin sekarang menggunakan Supabase dengan password yang di-hash menggunakan bcrypt untuk keamanan maksimal.

## 🗄️ Database Schema

### Tabel: `admin_users`

Tabel untuk menyimpan data admin yang bisa login ke sistem.

**Kolom:**

- `id` (UUID) - Primary key
- `username` (VARCHAR 50) - Username unik untuk login
- `password_hash` (TEXT) - Password yang di-hash dengan bcrypt
- `full_name` (VARCHAR 100) - Nama lengkap admin
- `email` (VARCHAR 100) - Email admin
- `role` (VARCHAR 20) - Role admin ('admin' atau 'superadmin')
- `is_active` (BOOLEAN) - Status aktif admin
- `last_login` (TIMESTAMP) - Waktu login terakhir
- `created_at` (TIMESTAMP) - Waktu pembuatan
- `updated_at` (TIMESTAMP) - Waktu update terakhir

## 🚀 Cara Setup

### 1. Jalankan Schema SQL

Buka Supabase SQL Editor dan jalankan file `schema.sql` yang sudah diupdate. File ini akan:

- Membuat tabel `admin_users`
- Mengaktifkan extension `pgcrypto` untuk hashing password
- Membuat fungsi `verify_admin_password()` untuk verifikasi login
- Membuat fungsi `create_admin_user()` untuk membuat admin baru
- Membuat fungsi `update_admin_password()` untuk update password
- Insert default admin user (username: admin, password: melati2024)

### 2. Verifikasi Setup

Setelah menjalankan schema, cek apakah tabel dan fungsi sudah terbuat:

```sql
-- Cek tabel admin_users
SELECT * FROM admin_users;

-- Cek fungsi verify_admin_password
SELECT verify_admin_password('admin', 'melati2024');
-- Harusnya return: true
```

### 3. Test Login

1. Jalankan aplikasi: `npm run dev`
2. Buka: `http://localhost:3000/login`
3. Login dengan:
   - **Username:** admin
   - **Password:** melati2024

## 🔐 Fitur Keamanan

### Password Hashing

- Password di-hash menggunakan **bcrypt** dengan salt rounds
- Password tidak disimpan dalam bentuk plain text
- Hash password dilakukan di database level menggunakan pgcrypto

### Session Management

- Session disimpan di localStorage dengan durasi 24 jam
- Auto logout setelah 24 jam
- Validasi session di setiap protected route

### SQL Functions

#### `verify_admin_password(p_username, p_password)`

Fungsi untuk verifikasi password saat login.

**Parameter:**

- `p_username` (VARCHAR) - Username yang akan diverifikasi
- `p_password` (TEXT) - Password yang akan diverifikasi

**Return:** BOOLEAN (true jika valid, false jika tidak)

**Contoh penggunaan:**

```sql
SELECT verify_admin_password('admin', 'melati2024');
```

#### `create_admin_user(p_username, p_password, p_full_name, p_email, p_role)`

Fungsi untuk membuat admin user baru dengan password ter-hash.

**Parameter:**

- `p_username` (VARCHAR) - Username baru
- `p_password` (TEXT) - Password (akan di-hash otomatis)
- `p_full_name` (VARCHAR) - Nama lengkap
- `p_email` (VARCHAR) - Email
- `p_role` (VARCHAR) - Role ('admin' atau 'superadmin')

**Return:** UUID (ID user yang baru dibuat)

**Contoh penggunaan:**

```sql
SELECT create_admin_user('john', 'password123', 'John Doe', 'john@example.com', 'admin');
```

#### `update_admin_password(p_user_id, p_new_password)`

Fungsi untuk update password admin.

**Parameter:**

- `p_user_id` (UUID) - ID user yang akan diupdate
- `p_new_password` (TEXT) - Password baru (akan di-hash otomatis)

**Return:** BOOLEAN (true jika berhasil update)

**Contoh penggunaan:**

```sql
SELECT update_admin_password('user-uuid-here', 'newpassword123');
```

## 👥 Menambah Admin Baru

### Via SQL Editor

```sql
-- Cara 1: Menggunakan fungsi create_admin_user
SELECT create_admin_user(
  'namauser',           -- username
  'password123',        -- password
  'Nama Lengkap',       -- full_name
  'email@example.com',  -- email
  'admin'               -- role
);

-- Cara 2: Insert manual (password akan di-hash)
INSERT INTO admin_users (username, password_hash, full_name, email, role)
VALUES (
  'namauser',
  crypt('password123', gen_salt('bf')),
  'Nama Lengkap',
  'email@example.com',
  'admin'
);
```

### Via Supabase Dashboard (Rekomendasi untuk Production)

Untuk keamanan yang lebih baik, Anda bisa membuat halaman admin untuk manage users di aplikasi.

## 🔄 Update Password

```sql
-- Update password untuk user tertentu
SELECT update_admin_password(
  'user-uuid-here',  -- ganti dengan UUID user
  'newpassword123'   -- password baru
);

-- Atau update langsung
UPDATE admin_users
SET password_hash = crypt('newpassword123', gen_salt('bf')),
    updated_at = now()
WHERE username = 'admin';
```

## 🛡️ Security Best Practices

1. **Jangan share credentials default** - Segera ganti password default setelah setup pertama
2. **Gunakan password yang kuat** - Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol
3. **Rotate password secara berkala** - Update password admin secara regular
4. **Monitor last_login** - Check kolom `last_login` untuk detect aktivitas mencurigakan
5. **Disable inactive accounts** - Set `is_active = false` untuk admin yang tidak aktif

## 📝 Catatan Penting

- **Default Admin:**
  - Username: `admin`
  - Password: `melati2024`
  - Role: `superadmin`
- **Segera ganti password default** setelah setup awal!

- Session duration: 24 jam (bisa diubah di `useAuth.ts`)

- Untuk production, pertimbangkan:
  - Implementasi 2FA (Two-Factor Authentication)
  - Rate limiting untuk prevent brute force
  - IP whitelisting untuk admin area
  - Audit logging untuk track semua aktivitas admin

## 🐛 Troubleshooting

### Error: "Cannot find name 'useSupabaseClient'"

Pastikan plugin Supabase sudah terinstall dan dikonfigurasi dengan benar.

### Error: "function verify_admin_password does not exist"

Jalankan ulang schema.sql untuk membuat fungsi SQL.

### Login gagal meski kredensial benar

1. Cek connection ke Supabase di browser console
2. Verify data di tabel `admin_users`
3. Test fungsi `verify_admin_password` langsung di SQL editor

### Session expired terus menerus

Cek localStorage browser, mungkin ada issue dengan `loginTime` storage.

## 📚 Referensi

- [Supabase pgcrypto Documentation](https://supabase.com/docs/guides/database/extensions/pgcrypto)
- [Bcrypt Hashing](https://en.wikipedia.org/wiki/Bcrypt)
- [PostgreSQL crypt() function](https://www.postgresql.org/docs/current/pgcrypto.html)
