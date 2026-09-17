export const checkEmailContent = {
  signup: {
    title: 'Check your email',
    heading: 'Confirm your account',
    description:
      'We sent a confirmation link to {email}. Open it to finish creating your Snaphost account.',
    buttonLabel: 'Go to sign in',
    buttonHref: '/sign-in',
  },
  forgotPassword: {
    title: 'Check your email',
    heading: 'Reset instructions sent',
    description:
      'We sent a reset link to {email}. Follow it to choose a new password.',
    buttonLabel: 'Back to sign in',
    buttonHref: '/sign-in',
  },
};

export type CheckEmailType = keyof typeof checkEmailContent;