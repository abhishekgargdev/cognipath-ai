import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConceptExplanation {
  id?: string;
  topic: string;
  theoreticalFoundation: string;
  underlyingMechanics: string;
  stepByStepTrace: string[];
  architecturalTakeaways: string;
  commonPitfalls: string[];
}

export const ConceptExplanationSchema = new Schema<IConceptExplanation>(
  {
    id: { type: String },
    topic: { type: String, required: true },
    theoreticalFoundation: { type: String, required: true },
    underlyingMechanics: { type: String, required: true },
    stepByStepTrace: { type: [String], default: [] },
    architecturalTakeaways: { type: String, required: true },
    commonPitfalls: { type: [String], default: [] },
  },
  { _id: false }
);

export interface IConceptExplanationDoc extends Document, IConceptExplanation {}

const StandaloneConceptExplanationSchema = new Schema<IConceptExplanationDoc>({
  id: { type: String },
  topic: { type: String, required: true },
  theoreticalFoundation: { type: String, required: true },
  underlyingMechanics: { type: String, required: true },
  stepByStepTrace: { type: [String], default: [] },
  architecturalTakeaways: { type: String, required: true },
  commonPitfalls: { type: [String], default: [] },
});

export const ConceptExplanation: Model<IConceptExplanationDoc> =
  mongoose.models.ConceptExplanation ||
  mongoose.model<IConceptExplanationDoc>('ConceptExplanation', StandaloneConceptExplanationSchema);
