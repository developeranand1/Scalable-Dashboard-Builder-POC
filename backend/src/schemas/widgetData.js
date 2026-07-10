const { z } = require('zod');

// Categorical: Simple Key-Value pairs
const CategoricalItemSchema = z.object({
  key: z.string().min(1, "Key must not be empty"),
  value: z.number()
});
const CategoricalDataSchema = z.array(CategoricalItemSchema);

// Temporal: Time-Series with ISO-8601 validation
const TemporalItemSchema = z.object({
  timestamp: z.string().datetime({ message: "Must be a valid ISO-8601 datetime string" }),
  value: z.number(),
  label: z.string().optional()
});
const TemporalDataSchema = z.array(TemporalItemSchema);

// Hierarchical: Tree structures
const HierarchicalNodeSchema = z.lazy(() =>
  z.object({
    name: z.string().min(1, "Name must not be empty"),
    value: z.number().optional(),
    children: z.array(HierarchicalNodeSchema).optional()
  }).refine(data => {
    return (data.value !== undefined) || (data.children && data.children.length > 0);
  }, {
    message: "A hierarchical node must contain either a 'value' or 'children'."
  })
);

// Relational: Coordinate-based data
const RelationalItemSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  label: z.string().optional()
});
const RelationalDataSchema = z.array(RelationalItemSchema);

// Dashboard validation schemas
const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['categorical', 'temporal', 'hierarchical', 'relational']),
  title: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  options: z.record(z.any()).optional()
});

const DashboardConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  widgets: z.array(WidgetConfigSchema)
});

module.exports = {
  CategoricalDataSchema,
  TemporalDataSchema,
  HierarchicalNodeSchema,
  RelationalDataSchema,
  WidgetConfigSchema,
  DashboardConfigSchema
};
