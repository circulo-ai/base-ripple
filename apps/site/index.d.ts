declare module '*.svg' {
  const content: string;
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
