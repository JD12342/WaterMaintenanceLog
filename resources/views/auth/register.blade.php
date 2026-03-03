<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Water Maintenance System</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    📝 Please use API for registration
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    This system uses API-based authentication with Laravel Sanctum
                </p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium mb-4">How to register:</h3>
                <ol class="list-decimal list-inside space-y-2 text-sm">
                    <li>Send POST request to <code class="bg-gray-100 px-2 py-1 rounded">/api/register</code></li>
                    <li>Include: name, email, password, password_confirmation</li>
                    <li>Optionally include role: ADMIN, ENGINEERING, MAINTENANCE, CONSUMER</li>
                    <li>Receive user data and authentication token</li>
                </ol>
                <div class="mt-6">
                    <h4 class="font-medium mb-2">Example request:</h4>
                    <pre class="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
POST /api/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "password_confirmation": "password123",
  "role": "CONSUMER"
}</pre>
                </div>
                <div class="mt-4">
                    <a href="/" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>