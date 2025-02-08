<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <script>
        // Extract query parameters from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const code = urlParams.get('code');

        // Construct the deep link URL
        const deepLink = `loneworker:///reset-password?email=${email}&code=${code}`;

        // Redirect to the deep link
        window.location.href = deepLink;

        // Fallback: If the app is not installed, redirect to a web page
        // setTimeout(function() {
        //     window.location.href = 'https://loneworker.etgraphics.net/reset-password';
        // }, 1000); // Wait 1 second before redirecting
    </script>
</head>
<body>
    <p>Redirecting to the app...</p>
</body>
</html>