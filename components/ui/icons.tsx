import {
    CheckCircle2,
    AlertCircle,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CloudLightning,
    ShieldCheck,
    UploadCloud,
    Sparkles,
    ArrowRight,
    MessageSquare,
} from 'lucide-react';
import { RiGoogleFill, RiGithubFill, RiDiscordFill } from 'react-icons/ri';

export const Icons = {
    checkCircle: CheckCircle2,
    alertCircle: AlertCircle,
    user: User,
    mail: Mail,
    lock: Lock,
    eye: Eye,
    eyeOff: EyeOff,
    loader: Loader2,
    cloudLightning: CloudLightning,
    shieldCheck: ShieldCheck,
    uploadCloud: UploadCloud,
    sparkles: Sparkles,
    arrowRight: ArrowRight,
    gitHub: RiGithubFill,
    google: RiGoogleFill,
    discord: RiDiscordFill,
    message: MessageSquare,
} as const;

export type IconKey = keyof typeof Icons;

export default Icons;
