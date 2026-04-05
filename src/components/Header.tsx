interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ 
  title = 'WebRCM', 
  subtitle = 'Web-based Fusee Launcher for Nintendo Switch' 
}: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
        {title}
      </h1>
      <p className="text-base-content/70 text-lg">
        {subtitle}
      </p>
    </header>
  );
}
