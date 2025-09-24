import { Link } from 'react-router-dom';
import { Shield, MapPin, Users, AlertTriangle, Smartphone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroImage from '@/assets/hero-safety.jpg';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Digital Tourist ID',
      description: 'Blockchain-secured digital identity for seamless verification and enhanced safety.',
    },
    {
      icon: MapPin,
      title: 'Smart Geo-fencing',
      description: 'Real-time alerts when entering restricted or potentially unsafe areas.',
    },
    {
      icon: AlertTriangle,
      title: 'Emergency SOS',
      description: 'One-tap panic button sharing live location with authorities and emergency contacts.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Intuitive mobile app designed for tourists with multilingual support.',
    },
    {
      icon: Eye,
      title: 'Authority Dashboard',
      description: 'Real-time monitoring and response coordination for tourism authorities.',
    },
    {
      icon: Users,
      title: 'Tourist Safety Score',
      description: 'AI-powered safety assessment based on location and movement patterns.',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Smart Tourist
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Safety System
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Advanced monitoring and emergency response system ensuring tourist safety with 
            blockchain-secured digital IDs and real-time location tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tourist">
              <Button variant="hero" className="text-lg px-8 py-4">
                <MapPin className="mr-2 h-5 w-5" />
                Tourist Portal
              </Button>
            </Link>
            <Link to="/authority">
              <Button variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="mr-2 h-5 w-5" />
                Authority Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced Safety Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive safety monitoring system designed to protect tourists and assist authorities 
              with real-time incident response capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-interactive p-6">
                  <CardHeader className="pb-4">
                    <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl w-fit mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Enhance Tourist Safety?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join the next generation of smart tourism safety with our comprehensive monitoring system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tourist">
              <Button variant="secondary" className="text-lg px-8 py-4">
                Get Started as Tourist
              </Button>
            </Link>
            <Link to="/authority">
              <Button variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Authority Access
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;