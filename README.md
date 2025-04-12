# Visitor Management System

A modern, secure, and efficient visitor management system built with Next.js, Prisma, and NextAuth.js.

## Features

- 🔐 **Secure Authentication**
  - Role-based access control (Admin, Security, Employee)
  - Email-based authentication
  - Password reset functionality

- 👥 **Visitor Management**
  - Visitor registration and pre-approval
  - Check-in/Check-out system
  - QR code-based visitor passes
  - Real-time visitor tracking

- 📊 **Dashboard & Analytics**
  - Real-time visitor statistics
  - Department-wise visitor distribution
  - Visitor flow analytics
  - Recent visitor history

- 📱 **Responsive Design**
  - Mobile-friendly interface
  - Modern UI components
  - Dark/Light mode support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **QR Code**: QR Code Generator
- **Charts**: Recharts

## Prerequisites

- Node.js 18.0.0 or later
- PostgreSQL database
- SMTP server for email functionality

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd visitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/visitor_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   SMTP_HOST="your-smtp-host"
   SMTP_PORT="your-smtp-port"
   SMTP_USER="your-smtp-user"
   SMTP_PASS="your-smtp-password"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Project Structure

```
visitor/
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── src/
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   ├── services/    # API services
│   ├── utils/       # Utility functions
│   └── types/       # TypeScript types
└── package.json     # Project dependencies
```

## Key Features Implementation

### Authentication
- Role-based access control
- Secure session management
- Password reset functionality

### Visitor Management
- Pre-approval workflow
- Check-in/out system
- QR code generation
- Real-time status updates

### Dashboard
- Real-time analytics
- Department-wise distribution
- Visitor flow tracking
- Recent visitor history

## Deployment

The application can be deployed on Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Set up environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email@example.com] or open an issue in the repository.

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who have helped improve this project
