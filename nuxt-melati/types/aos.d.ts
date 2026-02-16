declare module "aos" {
  interface AOSOptions {
    duration?: number;
    delay?: number;
    once?: boolean;
    offset?: number;
    easing?: string;
    anchorPlacement?: string;
    disable?: boolean | string;
  }

  interface AOS {
    init(options?: AOSOptions): void;
    refresh(): void;
    refreshHard(): void;
  }

  const AOS: AOS;

  export default AOS;
}
