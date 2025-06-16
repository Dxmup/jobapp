# CareerAI - Job Application Assistant

A comprehensive AI-powered platform designed to streamline your job search process with intelligent resume optimization, cover letter generation, and interview preparation tools.

## 🚀 Features

### Core Functionality
- **Resume Optimization**: AI-powered resume customization for specific job postings
- **Cover Letter Generation**: Automated cover letter creation tailored to job requirements
- **Interview Preparation**: Mock interviews with AI-generated questions
- **Job Tracking**: Comprehensive job application management system
- **Analytics Dashboard**: Track your application success rates and progress

### Advanced Features
- **Document Processing**: PDF and DOCX resume parsing with Google Gemini AI
- **Real-time Collaboration**: Live interview practice sessions
- **Calendar Integration**: Schedule and track interview appointments
- **Progress Analytics**: Detailed insights into your job search performance
- **Admin Panel**: Complete administrative interface for user and content management

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animation library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - Database and authentication
- **Google Gemini AI** - AI-powered content generation
- **Stripe** - Payment processing
- **Upstash Redis** - Caching and rate limiting

### Database
- **PostgreSQL** (via Supabase) - Primary database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/Dxmup/jobapp.git
   cd jobapp
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Copy the example environment file:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Configure the following environment variables:

   \`\`\`env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_jwt_secret

   # Database URLs
   POSTGRES_URL=your_postgres_url
   POSTGRES_PRISMA_URL=your_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

   # AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PRO_PRICE_ID=your_pro_price_id
   STRIPE_PREMIUM_PRICE_ID=your_premium_price_id
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_public_pro_price_id
   NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=your_public_premium_price_id
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Redis Configuration
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token

   # Application Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   \`\`\`

4. **Set up the database**
   
   Run the database migrations:
   \`\`\`bash
   npm run db:setup
   \`\`\`

5. **Create a master admin account**
   \`\`\`bash
   npm run create-admin
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

The application uses Supabase PostgreSQL with the following main tables:

- `users` - User profiles and authentication
- `jobs` - Job application tracking
- `resumes` - Resume storage and management
- `cover_letters` - Cover letter generation and storage
- `job_events` - Interview and application timeline events
- `interview_questions` - AI-generated interview questions
- `subscriptions` - Stripe subscription management

### Running Migrations

Execute the setup script to create all necessary tables:
\`\`\`bash
npm run db:migrate
\`\`\`

## 🔐 Authentication & Authorization

The application supports multiple authentication methods:

### User Authentication
- Email/password authentication via Supabase
- Social login (Google, GitHub) - configurable
- Session management with JWT tokens

### Admin Authentication
- Separate admin authentication system
- Role-based access control (RBAC)
- Two-factor authentication (2FA) support
- Audit logging for admin actions

### Permissions System
- User-level permissions for data access
- Admin-level permissions for system management
- Row-level security (RLS) policies in Supabase

## 🎨 UI Components

The application uses a comprehensive design system built on:

- **shadcn/ui** - Base component library
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Styling system
- **Lucide React** - Icon library

### Key Components
- Dashboard layouts and navigation
- Form components with validation
- Data tables and charts
- Modal dialogs and sheets
- Loading states and skeletons

## 🤖 AI Integration

### Google Gemini AI
- Resume optimization and customization
- Cover letter generation
- Interview question generation
- Document text extraction from PDFs

### AI Features
- Context-aware content generation
- Job description analysis
- Skills gap identification
- Interview preparation assistance

## 💳 Subscription Management

### Stripe Integration
- Pro and Premium subscription tiers
- Webhook handling for subscription events
- Customer portal for subscription management
- Usage-based billing support

### Subscription Features
- **Free Tier**: Basic job tracking
- **Pro Tier**: AI-powered resume optimization
- **Premium Tier**: Full feature access including mock interviews

## 📊 Analytics & Reporting

### User Analytics
- Application success rates
- Response time tracking
- Skills analysis
- Progress visualization

### Admin Analytics
- User engagement metrics
- System performance monitoring
- Revenue tracking
- Feature usage statistics

## 🔧 Development

### Project Structure
\`\`\`
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   ├── (admin)/           # Admin panel pages
│   ├── api/               # API routes
│   └── actions/           # Server actions
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── auth/              # Authentication components
│   └── admin/             # Admin panel components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:setup     # Set up database
npm run db:migrate   # Run database migrations
npm run create-admin # Create master admin account
\`\`\`

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript strict mode enabled
- Consistent naming conventions

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm run start
   \`\`\`

### Environment Configuration

Ensure all environment variables are properly configured in your deployment environment:
- Database connections
- API keys for external services
- Stripe webhook endpoints
- Redis configuration

## 🔒 Security

### Data Protection
- Row-level security (RLS) in Supabase
- JWT token validation
- Input sanitization and validation
- CORS configuration

### Best Practices
- Environment variable management
- Secure API endpoint design
- Rate limiting implementation
- Audit logging for sensitive operations

## 🧪 Testing

### Test Structure
\`\`\`bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
\`\`\`

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- Component testing with React Testing Library
- End-to-end testing with Playwright

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Job Management
- `GET /api/jobs` - List user jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Resume Management
- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Upload new resume
- `POST /api/ai/customize-resume` - AI resume optimization

### Cover Letters
- `GET /api/cover-letters` - List cover letters
- `POST /api/jobs/[id]/cover-letters` - Generate cover letter

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Commit your changes**
   \`\`\`bash
   git commit -m 'Add some amazing feature'
   \`\`\`
4. **Push to the branch**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [Issues](https://github.com/Dxmup/jobapp/issues) page
- Review the documentation
- Contact support at support@careerai.com

### Common Issues
- **Database connection errors**: Verify Supabase configuration
- **AI generation failures**: Check Google AI API key and quotas
- **Authentication issues**: Verify JWT secret and Supabase settings
- **Stripe webhook errors**: Ensure webhook endpoint is configured

## 🔄 Changelog

### Version 1.0.0
- Initial release with core features
- Resume optimization and cover letter generation
- Job tracking and analytics
- Admin panel implementation
- Stripe subscription integration

## 🎯 Roadmap

### Upcoming Features
- Mobile application
- Advanced analytics dashboard
- Integration with job boards
- Team collaboration features
- Advanced AI interview coaching

### Performance Improvements
- Database query optimization
- Caching strategy enhancement
- Bundle size optimization
- Loading performance improvements

---

**Built with ❤️ using Next.js, Supabase, and Google AI**
