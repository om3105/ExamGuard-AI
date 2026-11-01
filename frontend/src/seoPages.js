// Head tags for public routes. Also read by vite.config.js to build static HTML for indexable pages.
export const SITE_URL = 'https://examguardlive.vercel.app';

export const SEO_PAGES = {
    '/login': {
        title: 'Sign in | ExamGuard AI',
        description: 'Sign in to ExamGuard AI to take your assigned online exams, with explainable risk levels for teachers and automatic grading of coding questions.',
        indexable: true,
    },
    '/register': {
        title: 'Create account | ExamGuard AI',
        description: 'Create your ExamGuard AI candidate account, verify your email and take online exams with automatic grading of coding questions.',
        indexable: true,
    },
    '/forgot-password': {
        title: 'Forgot password | ExamGuard AI',
        description: "Forgot your ExamGuard AI password? Enter your email and we'll send you a reset link.",
    },
    '/reset-password': {
        title: 'Set new password | ExamGuard AI',
        description: 'Choose a new password for your ExamGuard AI account.',
    },
    '/auth/google/callback': {
        title: 'Signing in | ExamGuard AI',
        description: 'Completing Google sign-in to ExamGuard AI.',
    },
    '/admin/login': {
        title: 'Admin sign in | ExamGuard AI',
        description: 'Sign in to the ExamGuard AI admin portal to manage exams, monitor integrity and review candidate performance.',
    },
};
