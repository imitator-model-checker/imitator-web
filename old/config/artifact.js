module.exports = {
  artifacts: {
    tacas21: {
      image: 'imitator:tacas21',
      scripts: ['brp_experiments', 'generate_iterative', 'generate_strategies'],
      output_arg: '-o',
    },
  },
};
