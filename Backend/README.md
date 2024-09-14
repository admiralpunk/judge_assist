---

# Event Management and Judging Platform

This is a Node.js server application for creating and managing events and a judging platform. Users can create events, assign judges, and manage projects. Multiple judges can score projects, and the mean score of all judges will be calculated. Judges are assigned passwords for login, which are sent via email using Nodemailer.

## Features

- **Event Creation**: Users can create events.
- **Judge Management**: Assign judges to events, and send login credentials via email.
- **Project Scoring**: Multiple judges can score projects; the mean score is calculated.
- **Email Notifications**: Use Nodemailer to send login details to judges.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TechyMT/event-management-judging-platform.git
   cd event-management-judging-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables:

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. Access the application at `http://localhost:3000`.

## Nodemailer Configuration

The application uses Nodemailer to send emails. Ensure the following environment variables are set in the `.env` file:

- `EMAIL_SERVICE`: The email service provider (e.g., Gmail)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email password

## Contributing

Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.

## Acknowledgments

This project was part of my research internship at PICT Pune.

---
