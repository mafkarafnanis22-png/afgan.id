# Catatan OOP & Backend Architecture (Class & Inheritance)

## 1. Class Dasar — `User`

```php
class User
{
    // ===== PROPERTI =====
    protected $name;      // Nama user (protected = hanya bisa diakses class ini & turunannya)
    protected $email;     // Email user
    protected $password;  // Password (sudah dalam bentuk hash)

    // ===== CONSTRUCTOR =====
    // Dipanggil otomatis saat objek dibuat dengan `new User(...)`
    // Fungsinya: mengisi nilai awal properti saat objek dibuat
    public function __construct($name, $email, $password)
    {
        $this->name = $name;         // simpan parameter $name ke properti $this->name
        $this->email = $email;
        $this->password = $password;
    }

    // ===== METHOD: getName() =====
    // Fungsi: mengambil (getter) nilai properti $name dari luar class
    // Berguna karena $name bersifat protected, tidak bisa diakses langsung dari luar
    public function getName()
    {
        return $this->name;
    }

    // ===== METHOD: verifyPassword() =====
    // Fungsi: mengecek apakah password yang diinput user cocok dengan
    // password yang sudah di-hash dan tersimpan di database
    // $input = password mentah yang diketik user saat login
    public function verifyPassword($input)
    {
        return password_verify($input, $this->password);
        // password_verify() adalah fungsi bawaan PHP untuk membandingkan
        // password plain text dengan hash-nya (aman, tidak decode hash)
    }
}
```

**Cara pakai:**
```php
$user = new User("Budi", "budi@mail.com", "hashed_password");
// Fungsi: membuat objek baru dari class User, otomatis memanggil __construct()
```

---

## 2. Inheritance — Parent Class `Model`

```php
class Model
{
    protected $table;  // Nama tabel di database yang akan dipakai oleh class turunan

    // ===== METHOD: save() =====
    // Fungsi: mensimulasikan proses menyimpan data ke database
    // Method ini akan diwariskan ke semua class yang extends Model
    public function save()
    {
        echo "Menyimpan data ke tabel {$this->table}...";
    }

    // ===== METHOD: delete() =====
    // Fungsi: mensimulasikan proses menghapus data dari database
    // Juga diwariskan ke semua class turunan
    public function delete()
    {
        echo "Menghapus data dari tabel {$this->table}...";
    }
}
```

## 3. Child Class — `User extends Model`

```php
class User extends Model
{
    // ===== PROPERTI OVERRIDE =====
    // Mengisi nilai $table yang tadinya kosong di parent class Model
    // Karena User butuh tahu ia terhubung ke tabel 'users'
    protected $table = 'users';

    // ===== METHOD TAMBAHAN: sendWelcomeEmail() =====
    // Fungsi: khusus dimiliki User, tidak ada di Model
    // Contoh method yang HANYA relevan untuk entitas User
    public function sendWelcomeEmail()
    {
        echo "Mengirim email selamat datang...";
    }
}
```

**Penjelasan inheritance di sini:**
- `extends Model` → `User` otomatis "mewarisi" `save()` dan `delete()` dari `Model`, tanpa perlu menulis ulang.
- `User` juga bisa punya method sendiri (`sendWelcomeEmail()`) yang tidak dimiliki `Model`.
- Ini prinsip **DRY (Don't Repeat Yourself)** — logic umum ditulis sekali di parent, dipakai ulang di banyak child.

**Cara pakai:**
```php
$user = new User();
$user->save();             // fungsi dari parent (Model)
$user->sendWelcomeEmail(); // fungsi milik User sendiri
```

---

## 4. Penerapan di Laravel (Eloquent Model)

```php
class User extends Authenticatable
{
    // Fungsi: Authenticatable adalah class bawaan Laravel yang sudah
    // punya banyak fungsi siap pakai untuk autentikasi, contoh:
    // - save(), find(), where()   → dari Eloquent/Model
    // - getAuthPassword()         → untuk cek password saat login
    // - dll.
    // User cukup "extends" untuk otomatis mendapat semua kemampuan itu
}
```

---

## 5. Alur Request di Backend Architecture (Laravel)

```
Request → Middleware (cek token) → Controller → Model (User) → Database
```

### Contoh: `AuthController`

```php
class AuthController extends Controller
{
    // ===== METHOD: login() =====
    // Fungsi: menangani proses login user via API
    // $request = data yang dikirim dari client (email & password)
    public function login(Request $request)
    {
        // Cari user berdasarkan email yang dikirim
        $user = User::where('email', $request->email)->first();
        // where()  → fungsi bawaan Eloquent (turunan dari Model) untuk filter data
        // first()  → ambil satu data pertama yang cocok

        // Cek apakah user ditemukan DAN passwordnya cocok
        if ($user && $user->verifyPassword($request->password)) {
            $token = JWTAuth::fromUser($user);
            // fromUser() → fungsi dari package JWT untuk generate token
            // berdasarkan data user yang berhasil login

            return response()->json(['token' => $token]);
            // response()->json() → fungsi bawaan Controller (dari Laravel)
            // untuk mengembalikan response dalam format JSON
        }

        // Jika gagal, kembalikan error dengan status code 401 (Unauthorized)
        return response()->json(['error' => 'Unauthorized'], 401);
    }
}
```

**Penjelasan penting:**
- `extends Controller` → `AuthController` mewarisi fungsi `response()`, `validate()`, dll dari Controller bawaan Laravel.
- `Request $request` → objek yang otomatis berisi semua data yang dikirim client (email, password, header, dll).
- Karena `User` mewarisi dari `Model`/`Authenticatable`, ia langsung bisa pakai `where()`, `first()`, tanpa perlu menulis query SQL manual.

---

## 6. Ringkasan Fungsi-Fungsi yang Dipakai

| Fungsi/Method | Asal | Kegunaan |
|---|---|---|
| `__construct()` | PHP native | Inisialisasi objek saat pertama dibuat |
| `password_verify()` | PHP native | Cek kecocokan password plain vs hash |
| `save()` / `delete()` | Contoh custom / Eloquent | Simpan/hapus data ke database |
| `where()` | Eloquent (Model) | Filter data berdasarkan kondisi |
| `first()` | Eloquent (Model) | Ambil satu record pertama dari hasil query |
| `JWTAuth::fromUser()` | Package tymon/jwt-auth | Generate token JWT dari data user |
| `response()->json()` | Laravel Controller | Kirim balasan API dalam format JSON |
| `extends` | PHP OOP | Mewariskan properti & method dari parent class |

---

## 7. Poin Kunci untuk Diingat

1. **Class** = cetakan/blueprint untuk membuat objek.
2. **Inheritance** (`extends`) = child class otomatis mendapat semua method & properti parent-nya.
3. Di Laravel, hampir semua Model, Controller, dan Middleware Anda **sebenarnya adalah child class** dari class bawaan framework — itu sebabnya Anda tidak perlu menulis ulang fungsi dasar seperti `save()`, `response()`, atau `where()`.
4. Memahami ini akan sangat membantu saat Anda menambahkan sistem JWT ke `crud_api`, karena Anda tinggal **extend** dari class yang sudah menyediakan fondasi autentikasi.
