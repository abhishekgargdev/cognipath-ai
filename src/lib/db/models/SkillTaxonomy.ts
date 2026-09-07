import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkillTaxonomy extends Document {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  relatedSkills: string[];
  estHours: number;
  careerRelevance: string;
  description: string;
  trending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillTaxonomySchema = new Schema<ISkillTaxonomy>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    prerequisites: { type: [String], default: [] },
    relatedSkills: { type: [String], default: [] },
    estHours: { type: Number, required: true, default: 10 },
    careerRelevance: { type: String, required: true },
    description: { type: String, required: true },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'skills_taxonomies' }
);

SkillTaxonomySchema.index({ name: 'text', description: 'text', careerRelevance: 'text' });

export const SkillTaxonomy: Model<ISkillTaxonomy> =
  mongoose.models.SkillTaxonomy || mongoose.model<ISkillTaxonomy>('SkillTaxonomy', SkillTaxonomySchema);
