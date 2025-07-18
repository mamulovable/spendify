# Development Workflow & Collaboration Guidelines

## Development Commands
- **Start Development**: `npm run dev` - Starts Vite dev server on port 8080
- **Build Production**: `npm run build` - Creates optimized production build
- **Build Development**: `npm run build:dev` - Creates development build
- **Lint Code**: `npm run lint` - Runs ESLint for code quality checks
- **Preview Build**: `npm run preview` - Preview production build locally

## Git Workflow
- **Branch Naming**: Use descriptive branch names (e.g., `feature/ai-advisor`, `fix/auth-bug`)
- **Commit Messages**: Use conventional commits format
- **Pull Requests**: Require code review before merging
- **Main Branch**: Keep main branch stable and deployable
- **Feature Branches**: Create feature branches from main

## Code Review Guidelines
- **Functionality**: Ensure code works as expected
- **Performance**: Check for performance implications
- **Security**: Review for security vulnerabilities
- **Accessibility**: Verify accessibility compliance
- **Code Quality**: Follow established coding standards
- **Testing**: Ensure adequate test coverage

## Documentation Standards
- **Component Documentation**: Document component props and usage
- **API Documentation**: Document service functions and endpoints
- **README Updates**: Keep project README current
- **Changelog**: Maintain changelog for releases
- **Code Comments**: Add comments for complex business logic

## Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd spendlyai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Database Management
- **Migrations**: Use Supabase migrations for schema changes
- **Seeding**: Create seed data for development
- **Backup**: Regular database backups for production
- **Testing Data**: Separate test database for development
- **Schema Sync**: Keep local and production schemas in sync

## Feature Development Process
1. **Planning**: Define requirements and acceptance criteria
2. **Design**: Create UI/UX mockups if needed
3. **Implementation**: Write code following established patterns
4. **Testing**: Add unit and integration tests
5. **Review**: Submit pull request for code review
6. **Deployment**: Deploy to staging for testing
7. **Release**: Deploy to production after approval

## Troubleshooting Common Issues
- **Build Errors**: Check TypeScript compilation and import paths
- **Supabase Connection**: Verify environment variables and network
- **AI API Errors**: Check API keys and rate limits
- **Performance Issues**: Use React DevTools Profiler
- **Styling Issues**: Verify Tailwind classes and CSS variables

## Project Maintenance
- **Dependency Updates**: Regular updates for security and features
- **Performance Monitoring**: Track and optimize application performance
- **Error Monitoring**: Monitor and fix production errors
- **User Feedback**: Collect and prioritize user feedback
- **Technical Debt**: Regular refactoring and code cleanup