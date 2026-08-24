interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ 
  title = 'WebRCM', 
  subtitle = 'Web-based Fusee Launcher for Nintendo Switch' 
}: HeaderProps) {
  return (
    <header className="mb-6 text-center sm:mb-8">
      <h1 className="mb-2 text-3xl font-bold text-base-content sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="text-base text-base-content/70 sm:text-lg">
        {subtitle}
      </p>
    </header>
  );
}
