declare const config: {
  source: string[];
  platforms: {
    css: {
      transforms: string[];
      buildPath: string;
      files: Array<{
        destination: string;
        format: string;
      }>;
    };
  };
};

export default config;
