export type HeaderNavItem = {
    name: string;
    href: string;
};

export function getHeaderNavItems(isSignedIn: boolean): HeaderNavItem[] {
    return [
        { name: 'Upload', href: '/upload' },
        ...(isSignedIn ? [{ name: 'Profile', href: '/profile' }] : [{ name: 'Sign up', href: '/sign-up' }]),
    ];
}