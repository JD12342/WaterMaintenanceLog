<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Water Maintenance System</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    🔒 Please use API for authentication
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    This system uses API-based authentication with Laravel Sanctum
                </p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium mb-4">How to authenticate:</h3>
                <ol class="list-decimal list-inside space-y-2 text-sm">
                    <li>Use <code class="bg-gray-100 px-2 py-1 rounded">POST /api/register</code> to create an account</li>
                    <li>Use <code class="bg-gray-100 px-2 py-1 rounded">POST /api/login</code> to get a token</li>
                    <li>Include token in requests: <code class="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer {token}</code></li>
                </ol>
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