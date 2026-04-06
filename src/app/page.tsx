import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/sections/Hero";
import { TrustBar } from "@/sections/TrustBar";
import { Transformation } from "@/sections/Transformation";
import { Services } from "@/sections/Services";
import { Pricing } from "@/sections/Pricing";
import { Cases } from "@/sections/Cases";
import { Process } from "@/sections/Process";
import { About } from "@/sections/About";
import { Reviews } from "@/sections/Reviews";
import { Calculator } from "@/sections/Calculator";
import { Contacts } from "@/sections/Contacts";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Transformation />
        <Services />
        <Pricing />
        <Cases />
        <Process />
        <About />
        <Reviews />
        <Calculator />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
