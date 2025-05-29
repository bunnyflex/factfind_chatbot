# Insurance Advisor AI Chatbot - Phase 1

A conversational AI chatbot that naturally collects insurance information from customers through intelligent chat interactions, replacing traditional forms with human-like conversations.

## 🚀 Project Overview

**Product Name:** Insurance Advisor AI Chatbot  
**Version:** 1.0 (Phase 1)  
**Target Release:** 4-6 weeks  
**Product Type:** Web-based AI Chatbot (Serverless)

### Key Features (Phase 1)

- ✅ AI-powered chat interface for customer interaction
- ✅ Natural conversation flow for insurance data collection
- ✅ ChatGPT API integration for intelligent responses
- ✅ Serverless architecture (no server management)
- ✅ Mobile-responsive web interface
- ✅ Data extraction and validation from natural language
- ✅ Progress tracking and conversation state management

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with professional blue theme
- **UI Components:** shadcn/ui
- **AI Integration:** OpenAI ChatGPT API (to be implemented)
- **State Management:** React hooks + Local Storage (Phase 1)
- **Deployment:** Vercel (serverless)

## 📁 Project Structure

```
insurance-chatbot/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Global styles with insurance theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── chat/               # Chat-specific components (to be added)
│   │   └── forms/              # Form components (to be added)
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # shadcn/ui utilities
│   ├── hooks/                  # Custom React hooks (to be added)
│   ├── types/                  # TypeScript type definitions (to be added)
│   └── constants/              # Application constants (to be added)
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🎨 Design System

### Color Scheme

- **Primary Blue:** `#0047AB` (Professional insurance blue)
- **Light Blue:** `#1E5FBF` (Hover states, accents)
- **Dark Blue:** `#003A8C` (Dark mode, emphasis)
- **Accent:** `#E8F2FF` (Light backgrounds)
- **Muted:** `#F5F9FF` (Subtle backgrounds)

### Typography

- **Font:** Geist Sans (system font stack)
- **Headings:** Bold, professional hierarchy
- **Body:** Clean, readable text

### Components

- **Buttons:** Professional blue with hover effects
- **Cards:** Clean white/dark backgrounds with subtle shadows
- **Inputs:** Rounded corners with blue focus states
- **Progress:** Blue progress bars for data collection tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd insurance-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🧪 Testing the Setup

The current home page (`/`) includes a comprehensive setup verification that tests:

- ✅ Next.js 15 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS v4 with professional blue theme
- ✅ shadcn/ui components (Button, Card, Input, Badge, Progress)
- ✅ Mobile-responsive design
- ✅ ESLint configuration

## 📋 Development Roadmap

### Phase 1 Tasks (Current)

1. ✅ **Setup Next.js Project** - Complete
2. 🔄 **Implement Basic Chat Interface** - Next
3. ⏳ **Set Up Serverless Functions**
4. ⏳ **Implement Conversation State Management**
5. ⏳ **Integrate ChatGPT API**
6. ⏳ **Implement Smart Data Extraction**
7. ⏳ **Create Progress Tracking**
8. ⏳ **Add Quick Replies and Interactions**
9. ⏳ **Implement Conversation Summary**
10. ⏳ **Add Error Handling and Validation**
11. ⏳ **Mobile Optimization**
12. ⏳ **End-to-End Testing**

### Future Phases

- **Phase 2:** Admin portal, analytics dashboard
- **Phase 3:** WhatsApp integration, multi-language support
- **Phase 4:** Advanced AI features, quote generation

## 🔧 Configuration

### Environment Variables (to be added)

```bash
# API Configuration
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PROGRESS_TRACKING=true

# UI Configuration
NEXT_PUBLIC_MAX_MESSAGE_LENGTH=500
NEXT_PUBLIC_TYPING_DELAY=1000
```

### shadcn/ui Components Installed

- Button (Primary, Secondary, Outline, Ghost, Destructive)
- Card (Header, Content, Description)
- Input (Text input with professional styling)
- Textarea (Multi-line input)
- Scroll Area (Chat message scrolling)
- Avatar (User/AI avatars)
- Badge (Status indicators)
- Progress (Data collection progress)

## 🎯 Key Implementation Notes

### Mobile-First Design

- Responsive grid layouts
- Touch-friendly button sizes
- Optimized for mobile chat interactions
- Progressive enhancement for larger screens

### Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color ratios

### Performance

- Next.js App Router for optimal loading
- Component lazy loading
- Optimized bundle sizes
- Serverless deployment ready

## 🤝 Contributing

1. Follow the established code style
2. Use TypeScript for all new code
3. Test components on mobile devices
4. Maintain the professional blue color scheme
5. Document new features and APIs

## 📄 License

This project is proprietary and confidential.

---

**Next Step:** Implement Task 2 - Basic Chat Interface with message bubbles, input field, and typing indicators.
