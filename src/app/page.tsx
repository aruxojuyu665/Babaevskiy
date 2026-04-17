import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FabricShowcase } from "@/sections/FabricShowcase";
import { Hero } from "@/sections/Hero";
import { TrustBar } from "@/sections/TrustBar";
import { RepairOptions } from "@/sections/RepairOptions";
import { PhotoRequest } from "@/sections/PhotoRequest";
import { Corporate } from "@/sections/Corporate";
import { Payment } from "@/sections/Payment";
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
        <div className="defer-paint defer-paint-sm"><Transformation /></div>
        <div className="defer-paint defer-paint-md"><Services /></div>
        <div className="defer-paint defer-paint-md"><RepairOptions /></div>
        <div className="defer-paint defer-paint-md"><Pricing /></div>
        <div className="defer-paint defer-paint-md"><PhotoRequest /></div>
        <div className="defer-paint defer-paint-md"><Cases /></div>
        <div className="defer-paint defer-paint-md"><FabricShowcase /></div>
        <div className="defer-paint defer-paint-md"><Process /></div>
        <div className="defer-paint defer-paint-md"><Corporate /></div>
        <div className="defer-paint defer-paint-xl"><About /></div>
        <div className="defer-paint defer-paint-sm"><Reviews /></div>
        <div className="defer-paint defer-paint-lg"><Calculator /></div>
        <div className="defer-paint defer-paint-md"><Payment /></div>
        <div className="defer-paint defer-paint-md"><Contacts /></div>
      </main>
      <Footer />
    </>
  );
}
