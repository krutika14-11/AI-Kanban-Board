import { AIPlanSchema } from './ai.schemas';
import { z } from 'zod';

type AIPlan = z.infer<typeof AIPlanSchema>;

export function mockPlanGenerator(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  const today = new Date();

  // Detect tech stack from prompt
  const hasReact = lowerPrompt.includes('react');
  const hasNode = lowerPrompt.includes('node') || lowerPrompt.includes('express') || lowerPrompt.includes('backend');
  const hasAuth = lowerPrompt.includes('auth');
  const hasEcommerce = lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce') || lowerPrompt.includes('shop');
  const hasMobile = lowerPrompt.includes('mobile') || lowerPrompt.includes('react native');
  const hasAI = lowerPrompt.includes('ai') || lowerPrompt.includes('machine learning') || lowerPrompt.includes('ml');

  const deadlineDate = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  };

  const plan: AIPlan = {
    project: {
      name: extractProjectName(prompt),
      summary: generateSummary(prompt),
      estimatedDurationDays: 30,
    },
    tasks: generateTasks({ hasReact, hasNode, hasAuth, hasEcommerce, hasMobile, hasAI, deadlineDate }),
  };

  return JSON.stringify(plan, null, 2);
}

function extractProjectName(prompt: string): string {
  // Try to extract a meaningful name from the prompt
  const patterns = [
    /build (?:an? )?(.+?)(?:\s+using|\s+with|\s+that|\s+for|\s+in|\.|$)/i,
    /create (?:an? )?(.+?)(?:\s+using|\s+with|\s+that|\s+for|\s+in|\.|$)/i,
    /develop (?:an? )?(.+?)(?:\s+using|\s+with|\s+that|\s+for|\s+in|\.|$)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1] && match[1].length < 60) {
      return capitalize(match[1].trim());
    }
  }

  return 'Software Project';
}

function generateSummary(prompt: string): string {
  const truncated = prompt.length > 200 ? prompt.slice(0, 197) + '...' : prompt;
  return `A comprehensive software project based on the goal: "${truncated}". This plan covers setup, core features, testing, and deployment phases.`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface TaskContext {
  hasReact: boolean;
  hasNode: boolean;
  hasAuth: boolean;
  hasEcommerce: boolean;
  hasMobile: boolean;
  hasAI: boolean;
  deadlineDate: (days: number) => string;
}

function generateTasks(ctx: TaskContext): AIPlan['tasks'] {
  const { deadlineDate } = ctx;
  const tasks: AIPlan['tasks'] = [];

  // 1. Project Setup
  tasks.push({
    title: 'Project Setup & Architecture',
    description: 'Initialize the project repository, configure build tools, set up linting and formatting, and define the overall architecture.',
    priority: 'HIGH',
    status: 'TODO',
    estimatedHours: 4,
    suggestedDeadline: deadlineDate(2),
    category: 'Setup',
    tags: ['setup', 'architecture', 'configuration'],
    dependencies: [],
    executionOrder: 1,
    subtasks: [
      { title: 'Initialize repository with proper .gitignore', estimatedHours: 0.5 },
      { title: 'Configure ESLint and Prettier', estimatedHours: 1 },
      { title: 'Set up environment configuration', estimatedHours: 0.5 },
      { title: 'Define project architecture document', estimatedHours: 2 },
    ],
  });

  // 2. Database Design
  tasks.push({
    title: 'Database Design & Setup',
    description: 'Design the database schema, set up migrations, and create seed data for development.',
    priority: 'HIGH',
    status: 'TODO',
    estimatedHours: 6,
    suggestedDeadline: deadlineDate(4),
    category: 'Backend',
    tags: ['database', 'schema', 'migrations'],
    dependencies: ['Project Setup & Architecture'],
    executionOrder: 2,
    subtasks: [
      { title: 'Design entity-relationship diagram', estimatedHours: 2 },
      { title: 'Create database migrations', estimatedHours: 2 },
      { title: 'Set up ORM and database client', estimatedHours: 1 },
      { title: 'Create seed data', estimatedHours: 1 },
    ],
  });

  // 3. Auth (if applicable)
  if (ctx.hasAuth) {
    tasks.push({
      title: 'Authentication System',
      description: 'Implement secure user authentication with registration, login, session management, and password reset functionality.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 12,
      suggestedDeadline: deadlineDate(8),
      category: 'Backend',
      tags: ['authentication', 'security', 'jwt'],
      dependencies: ['Database Design & Setup'],
      executionOrder: 3,
      subtasks: [
        { title: 'Implement user registration API', estimatedHours: 3 },
        { title: 'Implement login with JWT tokens', estimatedHours: 3 },
        { title: 'Add refresh token rotation', estimatedHours: 2 },
        { title: 'Create password reset flow', estimatedHours: 2 },
        { title: 'Add rate limiting for auth endpoints', estimatedHours: 2 },
      ],
    });
  }

  // 4. Backend API
  if (ctx.hasNode) {
    tasks.push({
      title: 'Core REST API Development',
      description: 'Build the main REST API with proper routing, validation, error handling, and business logic.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 16,
      suggestedDeadline: deadlineDate(12),
      category: 'Backend',
      tags: ['api', 'rest', 'node.js', 'express'],
      dependencies: ctx.hasAuth ? ['Authentication System'] : ['Database Design & Setup'],
      executionOrder: 4,
      subtasks: [
        { title: 'Set up Express application structure', estimatedHours: 2 },
        { title: 'Implement CRUD endpoints for main entities', estimatedHours: 8 },
        { title: 'Add request validation middleware', estimatedHours: 2 },
        { title: 'Implement error handling middleware', estimatedHours: 2 },
        { title: 'Add API documentation', estimatedHours: 2 },
      ],
    });
  }

  // 5. Frontend
  if (ctx.hasReact) {
    tasks.push({
      title: 'Frontend Application Setup',
      description: 'Initialize the React application with routing, state management, and component architecture.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 8,
      suggestedDeadline: deadlineDate(10),
      category: 'Frontend',
      tags: ['react', 'vite', 'typescript', 'routing'],
      dependencies: ['Project Setup & Architecture'],
      executionOrder: 5,
      subtasks: [
        { title: 'Set up React with Vite and TypeScript', estimatedHours: 1 },
        { title: 'Configure React Router', estimatedHours: 2 },
        { title: 'Set up state management', estimatedHours: 2 },
        { title: 'Configure API client with Axios/TanStack Query', estimatedHours: 3 },
      ],
    });

    tasks.push({
      title: 'UI Component Library',
      description: 'Build reusable UI components following the design system: buttons, forms, modals, cards, and navigation.',
      priority: 'MEDIUM',
      status: 'TODO',
      estimatedHours: 12,
      suggestedDeadline: deadlineDate(15),
      category: 'Frontend',
      tags: ['components', 'ui', 'design-system', 'tailwind'],
      dependencies: ['Frontend Application Setup'],
      executionOrder: 6,
      subtasks: [
        { title: 'Create base Button, Input, and Card components', estimatedHours: 3 },
        { title: 'Implement Modal and Dialog components', estimatedHours: 3 },
        { title: 'Build Navigation and Layout components', estimatedHours: 3 },
        { title: 'Add loading states and error boundaries', estimatedHours: 3 },
      ],
    });
  }

  // 6. E-commerce features
  if (ctx.hasEcommerce) {
    tasks.push({
      title: 'Product Catalog Management',
      description: 'Implement product listing, search, filtering, and detail pages with inventory management.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 14,
      suggestedDeadline: deadlineDate(18),
      category: 'Feature',
      tags: ['products', 'catalog', 'search', 'inventory'],
      dependencies: ['Core REST API Development', 'UI Component Library'],
      executionOrder: 7,
      subtasks: [
        { title: 'Product listing page with pagination', estimatedHours: 3 },
        { title: 'Product search and filtering', estimatedHours: 4 },
        { title: 'Product detail page', estimatedHours: 3 },
        { title: 'Inventory management backend', estimatedHours: 4 },
      ],
    });

    tasks.push({
      title: 'Shopping Cart & Checkout',
      description: 'Build the shopping cart system with quantity management, coupon codes, and a complete checkout flow.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 16,
      suggestedDeadline: deadlineDate(22),
      category: 'Feature',
      tags: ['cart', 'checkout', 'payment'],
      dependencies: ['Product Catalog Management'],
      executionOrder: 8,
      subtasks: [
        { title: 'Shopping cart state management', estimatedHours: 4 },
        { title: 'Cart persistence and sync', estimatedHours: 3 },
        { title: 'Checkout form with address management', estimatedHours: 4 },
        { title: 'Order summary and confirmation', estimatedHours: 3 },
        { title: 'Payment integration (Stripe)', estimatedHours: 2 },
      ],
    });
  }

  // 7. AI features
  if (ctx.hasAI) {
    tasks.push({
      title: 'AI/ML Integration',
      description: 'Integrate AI capabilities including data preprocessing, model inference, and result presentation.',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 20,
      suggestedDeadline: deadlineDate(20),
      category: 'AI/ML',
      tags: ['ai', 'machine-learning', 'inference'],
      dependencies: ['Core REST API Development'],
      executionOrder: 7,
      subtasks: [
        { title: 'Set up local LLM runtime', estimatedHours: 3 },
        { title: 'Implement embedding generation', estimatedHours: 4 },
        { title: 'Build vector search pipeline', estimatedHours: 5 },
        { title: 'Create inference API endpoints', estimatedHours: 5 },
        { title: 'Add model result caching', estimatedHours: 3 },
      ],
    });
  }

  // 8. Testing
  tasks.push({
    title: 'Testing Suite',
    description: 'Write comprehensive unit tests, integration tests, and end-to-end tests for critical paths.',
    priority: 'MEDIUM',
    status: 'TODO',
    estimatedHours: 12,
    suggestedDeadline: deadlineDate(25),
    category: 'Testing',
    tags: ['testing', 'jest', 'unit-tests', 'integration'],
    dependencies: tasks.length > 3 ? [tasks[tasks.length - 1].title] : ['Core REST API Development'],
    executionOrder: tasks.length + 1,
    subtasks: [
      { title: 'Unit tests for service layer', estimatedHours: 4 },
      { title: 'Integration tests for API endpoints', estimatedHours: 4 },
      { title: 'Frontend component tests', estimatedHours: 4 },
    ],
  });

  // 9. Security & Performance
  tasks.push({
    title: 'Security Hardening & Performance Optimization',
    description: 'Audit and improve security posture, add rate limiting, implement caching, and optimize database queries.',
    priority: 'MEDIUM',
    status: 'TODO',
    estimatedHours: 8,
    suggestedDeadline: deadlineDate(27),
    category: 'DevOps',
    tags: ['security', 'performance', 'caching', 'optimization'],
    dependencies: ['Testing Suite'],
    executionOrder: tasks.length + 2,
    subtasks: [
      { title: 'Security audit and fix vulnerabilities', estimatedHours: 3 },
      { title: 'Add Redis caching layer', estimatedHours: 2 },
      { title: 'Optimize slow database queries', estimatedHours: 3 },
    ],
  });

  // 10. Deployment
  tasks.push({
    title: 'Deployment & CI/CD',
    description: 'Set up containerization, configure CI/CD pipeline, and deploy to cloud infrastructure.',
    priority: 'MEDIUM',
    status: 'TODO',
    estimatedHours: 8,
    suggestedDeadline: deadlineDate(30),
    category: 'DevOps',
    tags: ['docker', 'cicd', 'deployment', 'cloud'],
    dependencies: ['Security Hardening & Performance Optimization'],
    executionOrder: tasks.length + 3,
    subtasks: [
      { title: 'Dockerize application', estimatedHours: 2 },
      { title: 'Set up GitHub Actions CI/CD', estimatedHours: 3 },
      { title: 'Configure cloud deployment', estimatedHours: 2 },
      { title: 'Set up monitoring and alerting', estimatedHours: 1 },
    ],
  });

  return tasks;
}
