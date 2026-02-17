export default function ApplicationLogo({ className = '', ...props }) {
    return <img {...props} src="/ccb_logo_transparente.png" alt="Logo CCB" className={className} />;
}
