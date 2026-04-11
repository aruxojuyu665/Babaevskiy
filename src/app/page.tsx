import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionDivider } from "@/components/SectionDivider";
import { FabricShowcase } from "@/sections/FabricShowcase";
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
        <div className="defer-paint"><Transformation /></div>
        <div className="defer-paint"><Services /></div>
        <SectionDivider />
        <div className="defer-paint"><Pricing /></div>
        <SectionDivider variant="stitch" />
        <div className="defer-paint"><Cases /></div>
        <SectionDivider />
        <div className="defer-paint"><FabricShowcase /></div>
        <SectionDivider variant="stitch" />
        <div className="defer-paint"><Process /></div>
        <div className="defer-paint"><About /></div>
        <SectionDivider variant="stitch" />
        <div className="defer-paint"><Reviews /></div>
        <SectionDivider />
        <div className="defer-paint"><Calculator /></div>
        <div className="defer-paint"><Contacts /></div>
      </main>
      <Footer />
    </>
  );
}
