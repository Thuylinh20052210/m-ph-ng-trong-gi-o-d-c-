export type TopicId = 
  | 'circle-wheel'
  | 'circle-earth'
  | 'ellipse-kepler'
  | 'parabola-projectile'
  | 'helix-lorentz'
  | 'sine-harmonic'
  | 'custom-parametric';

export interface ParameterConfig {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
}

export interface TopicDefinition {
  id: TopicId;
  title: string;
  shortDesc: string;
  gradeLevel: 'Lớp 10' | 'Lớp 11' | 'Lớp 12' | 'Toán - Lý 10-12';
  mathFormula: string;
  mathExplanation: string;
  physicsTopic: string;
  physicsFormula: string;
  physicsExplanation: string;
  realWorldApp: string;
  parameters: ParameterConfig[];
  initialParams: Record<string, number>;
  cameraPosition: [number, number, number];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip?: string;
}

export interface SimulationTelemetry {
  time: number;
  x: number;
  y: number;
  z: number;
  velocity: number;
  acceleration: number;
  extraInfo?: { label: string; value: string }[];
}
