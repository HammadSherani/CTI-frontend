// After login: the page that asked for it (?next=/…), otherwise the user's home.
export function pathAfterLogin(user) {
    const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
    // only a path inside this site, never another address
    return next && /^\/(?!\/)[\w\-./]*$/.test(next) ? next : homePathForUser(user);
}

// Where a logged-in user belongs (after login, or when they open a guest-only page like /auth/login).
export function homePathForUser(user) {
    switch (user?.role) {
        case 'admin':
            return '/admin/dashboard';
        case 'repairman':
            // KYC not started yet: finish the profile first
            return user?.kycStatus === 'not_submitted' ? '/repair-man/complete-profile' : '/repair-man/dashboard';
        case 'seller':
            return '/seller/dashboard';
        default:
            return '/';
    }
}
