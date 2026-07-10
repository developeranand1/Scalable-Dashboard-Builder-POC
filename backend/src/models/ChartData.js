const { Schema, model } = require('mongoose');

// 1. Categorical Item Schema
const CategoricalSchema = new Schema({
  source: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: Number, required: true }
});
// Create compound index for faster retrieval
CategoricalSchema.index({ source: 1 });

// 2. Temporal Item Schema
const TemporalSchema = new Schema({
  source: { type: String, required: true },
  timestamp: { type: Date, required: true },
  value: { type: Number, required: true },
  label: { type: String }
});
TemporalSchema.index({ source: 1, timestamp: 1 });

// 3. Hierarchical Item Schema (Nested tree stored as one document per source)
const HierarchicalSchema = new Schema({
  source: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  value: { type: Number },
  children: { type: Array, default: [] }
});

// 4. Relational Item Schema
const RelationalSchema = new Schema({
  source: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number },
  label: { type: String }
});
RelationalSchema.index({ source: 1 });

module.exports = {
  CategoricalModel: model('CategoricalData', CategoricalSchema),
  TemporalModel: model('TemporalData', TemporalSchema),
  HierarchicalModel: model('HierarchicalData', HierarchicalSchema),
  RelationalModel: model('RelationalData', RelationalSchema)
};
