# EcoAlert - Pollution Intelligence & Emergency Response Suite

EcoAlert is a comprehensive environmental monitoring and emergency response platform that provides real-time air, water, and noise quality data with AI-powered insights and community-driven initiatives.

## Features

### Real-time Environmental Monitoring
- **Air Quality Tracking**: Monitor AQI, PM2.5, PM10, O3, NO2, SO2, and CO levels
- **Water Quality Monitoring**: Track pH levels, turbidity, and other water parameters
- **Noise Pollution Detection**: Measure ambient noise levels in your area
- **Environmental Sensors**: Integration with IoT sensors for continuous data collection

### AI-Powered Analytics
- **Predictive Analytics**: Forecast environmental trends and pollution patterns
- **Anomaly Detection**: Identify unusual pollution spikes and potential hazards
- **Personalized Recommendations**: Get tailored suggestions based on your local conditions
- **Health Risk Assessment**: Evaluate potential health impacts based on environmental data

### Emergency Response System
- **Real-time Alerts**: Receive instant notifications for environmental hazards
- **Multi-severity Warnings**: Categorize alerts by importance (low, moderate, high, critical)
- **Command Center**: Centralized emergency management interface
- **Location-based Notifications**: Alerts specific to your geographic area

### Community Features
- **Social Impact Tracking**: Monitor collective environmental contributions
- **Achievement System**: Earn badges and rewards for environmental actions
- **Community Challenges**: Participate in local and global environmental initiatives
- **Leaderboards**: Compare impact with other community members

### Educational Resources
- **Learning Content**: Access articles, videos, and tips about environmental protection
- **Environmental Facts**: Discover interesting and important environmental information
- **Best Practices**: Learn how to reduce your environmental footprint
- **Guides**: Step-by-step instructions for eco-friendly living

## Technology Stack

- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Authentication**: Clerk for secure user management
- **Backend**: Convex for database and serverless functions
- **UI Components**: Radix UI with Tailwind CSS for consistent design
- **Real-time Updates**: Socket.io for live data streaming
- **Maps & Visualization**: React Leaflet and Recharts for data presentation
- **AI Integration**: Google AI with Genkit for predictive analytics

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm or yarn package manager
- Clerk account (for authentication)
- Convex account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecoalert.git
cd ecoalert
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your required API keys and configuration.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_SECRET_KEY=your_convex_secret_key

# Google AI (for Genkit)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Other Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Database Setup
The application uses Convex for data persistence. The database schema is defined in `convex/schema.ts` and includes tables for:
- User profiles and authentication
- Environmental sensor data
- Alerts and notifications
- Community posts and comments
- User usage tracking and subscriptions

## API Routes

The application exposes several API endpoints for data management:

- `/api/analytics/` - Analytics and reporting
- `/api/auth/` - Authentication endpoints
- `/api/educational/` - Educational content management
- `/api/environment/` - Environmental data endpoints
- `/api/integrations/` - Third-party integrations
- `/api/pollution/` - Pollution data management
- `/api/social/` - Social features
- `/api/user/` - User profile management

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with file watching

## Deployment

### Vercel (Recommended)
1. Push your code to a Git repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact our support team at support@ecoalert.app.

## Acknowledgments

- Thank you to the open-source community for the amazing tools and libraries used in this project
- Special thanks to the Clerk, Convex, and Google AI teams for their excellent developer platforms
- Environmental organizations and researchers who provided data and insights for this project

---

*EcoAlert - Making environmental data accessible and actionable for everyone.*
