<!DOCTYPE html>
<html>
<head>
    <title>Missed Check-In Alert</title>
</head>
<body>
    <h1>Missed Check-In Alert</h1>
    <p>Hello,</p>
    <p>
        The worker <strong>{{ $data['name'] }}</strong> has missed their scheduled check-in due at
        <strong>{{ $data['scheduled_time']->format('F j, Y g:i A') }}</strong>.
    </p>
    <p>Please take appropriate action.</p>
    <p>Thank you,</p>
    <p>Loneworker</p>
</body>
</html>