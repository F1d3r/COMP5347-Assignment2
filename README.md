# OldPhoneDeals - eCommerce Web Application (COMP5347/COMP4347)

A full-stack MEAN (MongoDB, Express, Angular, Node.js) eCommerce web application for buying and selling old phones.

## Overview

This repository contains the implementation for Assignment 2 of the Web Application Development course (COMP5347/COMP4347). OldPhoneDeals is a three-tier web application that provides both user and admin interfaces for an eCommerce platform specializing in second-hand phones.

## Assignment Requirements

The application implements:
- User interface with search, filter, cart, and checkout functionality
- Admin interface for managing users, listings, and monitoring sales
- Authentication with email verification
- User profiles with listing management
- Review and comment system

## Repository Structure

```
oldphonedeals/
├── client/                  # Angular frontend
│   ├── src/                 # Source code
│   ├── angular.json         # Angular configuration
│   └── package.json         # Frontend dependencies
├── server/                  # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   └── server.js            # Entry point
├── dataset/                 # Initial dataset files
│   ├── phonelisting.json    # Phone listing data
│   ├── userlist.json        # User data
│   └── images/              # Phone images
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v16.x or higher)
- npm (v8.x or higher)
- MongoDB (v5.0 or higher)
- Angular CLI (v15.x or higher)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/oldphonedeals.git
   cd oldphonedeals
   ```

2. **Install dependencies**
   ```bash
   # Install mongodb on MacOS
   brew tap mongodb/brew
   brew install mongodb-community

   # Install server dependencies
   cd server
   npm install
   cd ..
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/OldPhoneDeals
   DEFAULT_PASSWORD=Password123!
   SALT_ROUNDS=10

   # Session Configuration
   SESSION_SECRET=TOP-SECRET

   # JWT Configuration
   JWT_SECRET=JWT_SECRET

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=tut07g04.comp5347@gmail.com
   EMAIL_PASSWORD=ahxsrummwfkabydg
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the development servers**
   ```bash
   # Start the backend server
   npm run server
   
   # In a separate terminal, start the Angular development server
   npm run client
   ```

6. **Access the application**
   - Main application: http://localhost:4200
   - Admin interface: http://localhost:4200/admin

## Development Scripts

The following npm scripts are available:

- `npm run server`: Start the backend server
- `npm run init-db`: Initialize the database with sample data
- `npm start`: Start the production server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## Team Members

- [Your Name]
- [Team Member 2]
- [Team Member 3]
- [Team Member 4]
- [Team Member 5]

## License

This project is created for educational purposes as part of the COMP5347/COMP4347 course.
