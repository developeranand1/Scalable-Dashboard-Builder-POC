const {
  CategoricalModel,
  TemporalModel,
  HierarchicalModel,
  RelationalModel
} = require('../models/ChartData');
const {
  generateCategoricalData,
  generateTemporalData,
  generateHierarchicalData,
  generateRelationalData
} = require('./mockDataGenerator');

async function seedDatabase() {
  try {
    console.log('Checking database collections for seed data...');

    // 1. Seed Categorical
    const categoricalCount = await CategoricalModel.countDocuments();
    if (categoricalCount === 0) {
      console.log('Seeding Categorical data into MongoDB Atlas...');
      const sources = ['sales', 'regions', 'browsers'];
      for (const src of sources) {
        const rawItems = generateCategoricalData(src);
        const dbItems = rawItems.map(item => ({ source: src, ...item }));
        await CategoricalModel.insertMany(dbItems);
      }
      console.log('Successfully seeded Categorical data.');
    }

    // 2. Seed Temporal (Time-Series)
    const temporalCount = await TemporalModel.countDocuments();
    if (temporalCount === 0) {
      console.log('Seeding Temporal time-series data into MongoDB Atlas...');
      const configs = [
        { period: '30d', trend: 'seasonal', source: 'traffic-seasonal' },
        { period: '30d', trend: 'upward', source: 'traffic-upward' },
        { period: '24h', trend: 'seasonal', source: 'traffic-seasonal-24h' }
      ];
      for (const config of configs) {
        const rawItems = generateTemporalData(config.period, config.trend);
        const dbItems = rawItems.map(item => ({
          source: config.source,
          timestamp: new Date(item.timestamp),
          value: item.value,
          label: item.label
        }));
        await TemporalModel.insertMany(dbItems);
      }
      console.log('Successfully seeded Temporal data.');
    }

    // 3. Seed Hierarchical (Tree Maps)
    const hierarchicalCount = await HierarchicalModel.countDocuments();
    if (hierarchicalCount === 0) {
      console.log('Seeding Hierarchical tree map data into MongoDB Atlas...');
      const sources = ['organization', 'disk'];
      for (const src of sources) {
        const rawTree = generateHierarchicalData(src);
        await HierarchicalModel.create({
          source: src,
          name: rawTree.name,
          value: rawTree.value,
          children: rawTree.children || []
        });
      }
      console.log('Successfully seeded Hierarchical data.');
    }

    // 4. Seed Relational (Scatter plots)
    const relationalCount = await RelationalModel.countDocuments();
    if (relationalCount === 0) {
      console.log('Seeding Relational correlation data into MongoDB Atlas...');
      const sources = ['marketing', 'fitness'];
      for (const src of sources) {
        const rawItems = generateRelationalData(src);
        const dbItems = rawItems.map(item => ({ source: src, ...item }));
        await RelationalModel.insertMany(dbItems);
      }
      console.log('Successfully seeded Relational data.');
    }

    console.log('MongoDB Atlas seeding check complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = { seedDatabase };
