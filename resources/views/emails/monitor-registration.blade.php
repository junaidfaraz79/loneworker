<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Account Credentials</title>
</head>
<body>
    <p>Hello {{ $username }},</p>
    <p>Your new monitor account has been created. Here are your login credentials:</p>
    <p><strong>Email:</strong> {{ $email }}</p>
    <p><strong>Password:</strong> {{ $password }}</p>
    <p>Please log in and change your password immediately for security reasons.</p>
</body>
</html>
