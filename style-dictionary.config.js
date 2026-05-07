export default {
  source: ['tokens/tokens.json'],
  platforms: {
    css: {
      transforms: ['name/tikitak-path-kebab'],
      buildPath: 'src/app/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'tikitak/tailwind-v4-css',
        },
      ],
    },
  },
};
