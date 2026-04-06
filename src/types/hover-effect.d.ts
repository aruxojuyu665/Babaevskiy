declare module "hover-effect" {
  interface HoverEffectOptions {
    parent: HTMLElement;
    intensity?: number;
    image1: string;
    image2: string;
    displacementImage: string;
    speedIn?: number;
    speedOut?: number;
    hover?: boolean;
    easing?: string;
  }

  export default class HoverEffect {
    constructor(options: HoverEffectOptions);
  }
}
