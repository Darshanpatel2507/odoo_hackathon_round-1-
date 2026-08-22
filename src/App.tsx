import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PopularDestinations from './components/PopularDestinations';
import ProductShowcase from './components/ProductShowcase';
import Features from './components/Features';
import AdventureGrid from './components/AdventureGrid';
import TemplatesAndCTA from './components/TemplatesAndCTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <PopularDestinations />
        <ProductShowcase />
        <Features />
        <AdventureGrid />
        <TemplatesAndCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
