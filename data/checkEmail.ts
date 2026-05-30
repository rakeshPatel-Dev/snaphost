export const checkEmailContent = {
  signup: {
    title: 'Check your email',
    heading: 'Confirm your account',
    description:
      'We sent an email to {email} with a link to confirm your account. Click the link to finish creating your SnapHost account.',
    buttonLabel: 'Go to sign in',
    buttonHref: '/sign-in',
  },
  forgotPassword: {
    title: 'Check your email',
    heading: 'Reset instructions sent',
    description:
      'We sent password reset instructions to {email}. Follow the link in the email to choose a new password.',
    buttonLabel: 'Back to sign in',
    buttonHref: '/sign-in',
  },
};

export type CheckEmailType = keyof typeof checkEmailContent;
