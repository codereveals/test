const VerificationEmail = (otp) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color:rgb(190, 254, 213);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            font-size: 16px;
            color: #666666;
        }
        .otp-code {
            margin: 20px 0;
            font-size: 24px;
            color: #007bff;
            font-weight:bold;
        }
        .footer {
            margin-top: 20px;
            color: #999999;
        }
    </style>
</head>
<body>

<div class="container">

    <h1>Email Verification</h1>
    <p>Your OTP (One-Time Password) for verification:</p>
    <p class="otp-code">${otp}</p>
    <p>Please use this OTP to verify your email address.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p class="footer">Regards,<br>Code Reveals Inc.</p>
</div>

</body>
</html>`;
}

export default VerificationEmail;
