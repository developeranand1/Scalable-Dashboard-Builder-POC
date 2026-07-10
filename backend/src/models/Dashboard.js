const { Schema, model } = require('mongoose');

const WidgetSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['categorical', 'temporal', 'hierarchical', 'relational'] 
  },
  title: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  options: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const DashboardSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  widgets: [WidgetSchema]
}, {
  timestamps: true
});

const DashboardModel = model('Dashboard', DashboardSchema);

module.exports = { DashboardModel };
