/// <reference types="vite/client" />

// Allow JSON imports
declare module "*.json" {
  const value: any;
  export default value;
}

// Allow common image formats
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
