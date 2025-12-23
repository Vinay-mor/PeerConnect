# 🌐 PeerConnect - AI-Powered Peer Skill-Sharing Platform

<div align="center">

**Revolutionizing the way peers learn from each other through intelligent skill-sharing**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge&logo=vercel)](https://peer-connect-ochre.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Vinay-mor/PeerConnect)
[![TypeScript](https://img.shields.io/badge/TypeScript-95.4%25-blue?style=for-the-badge&logo=typescript)](.)
[![Next.js](https://img.shields.io/badge/Next.js-Modern%20Stack-black?style=for-the-badge&logo=next.js)](.)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**PeerConnect** is an innovative AI-powered platform that connects peers to share skills, knowledge, and expertise in real-time. Whether you're looking to learn a new skill or teach something you're passionate about, PeerConnect makes it seamless and efficient.

### Why PeerConnect?

- **Intelligent Matching**: AI algorithms match users based on complementary skills and learning goals
- **Peer-to-Peer Learning**: Direct connections between learners and teachers without intermediaries
- **Skill Verification**: Built-in mechanisms to verify and validate peer expertise
- **Community-Driven**: Foster a collaborative learning environment
- **Seamless Experience**: Modern, intuitive interface built with cutting-edge technology

---

## ✨ Features

### Core Features

- **Smart Skill Matching**: AI-powered algorithm to match compatible peers
- **Real-time Communication**: Connect with peers instantly
- **Skill Profiles**: Create detailed profiles showcasing your expertise
- **Learning Paths**: Structured learning journeys with milestones
- **Progress Tracking**: Monitor your learning and teaching progress
- **Ratings & Reviews**: Community-driven quality assurance
- **Session Management**: Schedule and manage peer learning sessions
- **Resource Sharing**: Exchange learning materials and resources

### Advanced Features

- **AI Recommendations**: Personalized skill recommendations
- **Analytics Dashboard**: Insights into your learning journey
- **Certification Badges**: Earn achievements for completed learning paths
- **Community Forums**: Discuss topics with the broader community
- **Search & Discovery**: Find peers and skills with advanced filtering

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15+** - Modern React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Hooks** - Custom hooks for state management

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Supabase** - PostgreSQL database + authentication
- **Database** - PostgreSQL via Supabase

### AI & ML
- **Vercel AI SDK** - AI integration framework
- **Vector Embeddings** - For intelligent skill matching
- **Large Language Models** - AI-powered features

### Deployment
- **Vercel** - Hosting and deployment
- **Edge Functions** - Serverless computation

### Development Tools
- **ESLint** - Code quality
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **pnpm** - Fast package manager

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or pnpm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vinay-mor/PeerConnect.git
cd PeerConnect
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI/LLM
OPENAI_API_KEY=your_openai_api_key
# or use Vercel AI Gateway (recommended)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
PeerConnect/
├── app/                        # Next.js app directory
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── (auth)/                # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   ├── skills/
│   │   ├── matches/
│   │   └── sessions/
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── skills/
│   │   ├── matches/
│   │   └── sessions/
│   └── globals.css            # Global styles
│
├── components/                 # Reusable React components
│   ├── ui/                    # UI library components (shadcn/ui)
│   ├── auth/                  # Authentication components
│   ├── dashboard/             # Dashboard components
│   ├── skills/                # Skills management components
│   ├── matches/               # Matching components
│   └── shared/                # Shared components
│
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts
│   ├── use-auth.ts
│   ├── use-skills.ts
│   └── use-matches.ts
│
├── lib/                        # Utility functions and helpers
│   ├── supabase/              # Supabase client and helpers
│   ├── api.ts                 # API client
│   ├── ai.ts                  # AI integration
│   └── utils.ts               # General utilities
│
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── scripts/                    # Utility scripts
│   └── seed.ts                # Database seeding
│
├── styles/                     # Global styles
│   └── variables.css          # CSS variables
│
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── postcss.config.mjs         # PostCSS configuration
└── README.md                  # This file
```

---

## 🎨 Key Components

### Authentication Components
- **LoginForm** - User login with email/password
- **SignupForm** - New user registration
- **AuthGuard** - Protected route wrapper
- **UserMenu** - User profile and logout menu

### Dashboard Components
- **DashboardLayout** - Main dashboard layout
- **SkillCard** - Displays individual skills
- **MatchCard** - Shows matched peers
- **SessionScheduler** - Schedule learning sessions
- **ProgressTracker** - Visualize learning progress

### Skill Management
- **SkillForm** - Create/edit skill profiles
- **SkillList** - Display user's skills
- **SkillSearch** - Search and discover skills
- **SkillValidator** - Verify skill authenticity

### Matching Engine
- **MatchFinder** - AI-powered matching algorithm
- **MatchList** - Display matched peers
- **MatchFilter** - Filter matches by criteria
- **MatchChat** - Direct messaging with matches

---

## 🔧 Getting Started

### For Developers

See [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for detailed setup instructions and development guidelines.

### For Contributors

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines and best practices.

### API Documentation

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📧 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Vinay-mor/PeerConnect/issues)
- **Email**: support@peerconnect.dev
- **Documentation**: See the [docs](./docs) folder

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for seamless backend services
- shadcn/ui for beautiful components
- The open-source community

---

<div align="center">

Made with ❤️ by Vinay Mor

[⭐ Star us on GitHub](https://github.com/Vinay-mor/PeerConnect)

</div>

