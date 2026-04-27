export const UNIVERSITY_STATUSES = ["active", "inactive", "draft"] as const;
export const STUDY_LEVELS = ["bachelor", "master", "phd", "certificate"] as const;
export const STUDY_MODES = ["full-time", "part-time", "online", "hybrid"] as const;

export type UniversityStatus = (typeof UNIVERSITY_STATUSES)[number];
export type StudyLevel = (typeof STUDY_LEVELS)[number];
export type StudyMode = (typeof STUDY_MODES)[number];

export interface UniversityLocation {
  country: string;
  city: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UniversityContacts {
  email?: string | null;
  phone?: string | null;
}

export interface StudyProgram {
  id: string;
  name: string;
  degree: StudyLevel;
  mode: StudyMode;
  durationMonths?: number | null;
  language?: string | null;
  tuitionPerYear?: number | null;
}

export interface University {
  id: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  status: UniversityStatus;
  website?: string | null;
  location: UniversityLocation;
  contacts?: UniversityContacts | null;
  programs: StudyProgram[];
  createdAt: string;
  updatedAt: string;
}

type Schema =
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | EnumSchema
  | UrlSchema
  | EmailSchema
  | DateTimeSchema
  | ObjectSchema
  | ArraySchema;

interface BaseSchema {
  required?: boolean;
  generated?: boolean;
  defaultValue?: unknown;
}

interface StringSchema extends BaseSchema {
  type: "string";
  maxLength?: number;
}

interface NumberSchema extends BaseSchema {
  type: "number";
  min?: number;
  max?: number;
}

interface IntegerSchema extends BaseSchema {
  type: "integer";
  min?: number;
  max?: number;
}

interface EnumSchema extends BaseSchema {
  type: "enum";
  values: readonly string[];
}

interface UrlSchema extends BaseSchema {
  type: "url";
}

interface EmailSchema extends BaseSchema {
  type: "email";
}

interface DateTimeSchema extends BaseSchema {
  type: "datetime";
}

interface ObjectSchema extends BaseSchema {
  type: "object";
  fields: Record<string, Schema>;
}

interface ArraySchema extends BaseSchema {
  type: "array";
  item: Schema;
}

export interface ValidationOptions {
  allowGenerated?: boolean;
  partial?: boolean;
}

export interface ValidationResult<T> {
  valid: boolean;
  value: Partial<T>;
  errors: string[];
}

export const universitySchema: Record<keyof University, Schema> = {
  id: { type: "string", required: true, generated: true },
  name: { type: "string", required: true, maxLength: 200 },
  shortName: { type: "string", maxLength: 32 },
  description: { type: "string", maxLength: 4000 },
  status: { type: "enum", required: true, values: UNIVERSITY_STATUSES },
  website: { type: "url" },
  location: {
    type: "object",
    required: true,
    fields: {
      country: { type: "string", required: true, maxLength: 100 },
      city: { type: "string", required: true, maxLength: 120 },
      address: { type: "string", maxLength: 240 },
      latitude: { type: "number", min: -90, max: 90 },
      longitude: { type: "number", min: -180, max: 180 }
    }
  },
  contacts: {
    type: "object",
    fields: {
      email: { type: "email" },
      phone: { type: "string", maxLength: 64 }
    }
  },
  programs: {
    type: "array",
    required: true,
    defaultValue: [],
    item: {
      type: "object",
      fields: {
        id: { type: "string", required: true, generated: true },
        name: { type: "string", required: true, maxLength: 200 },
        degree: { type: "enum", required: true, values: STUDY_LEVELS },
        mode: { type: "enum", required: true, values: STUDY_MODES },
        durationMonths: { type: "integer", min: 1, max: 120 },
        language: { type: "string", maxLength: 80 },
        tuitionPerYear: { type: "number", min: 0 }
      }
    }
  },
  createdAt: { type: "datetime", required: true, generated: true },
  updatedAt: { type: "datetime", required: true, generated: true }
};

export function validateUniversity(input: unknown, options: ValidationOptions = {}): ValidationResult<University> {
  return validateObject(input, universitySchema, "university", {
    allowGenerated: options.allowGenerated === true,
    partial: options.partial === true
  }) as ValidationResult<University>;
}

function validateObject(
  input: unknown,
  schema: Record<string, Schema>,
  path: string,
  options: Required<ValidationOptions>
): ValidationResult<Record<string, unknown>> {
  const errors: string[] = [];
  const output: Record<string, unknown> = {};

  if (!isPlainObject(input)) {
    return {
      valid: false,
      value: output,
      errors: [`${path} must be an object.`]
    };
  }

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldPath = `${path}.${fieldName}`;
    const value = input[fieldName];

    if (value === undefined) {
      if (fieldSchema.defaultValue !== undefined && !options.partial) {
        output[fieldName] = cloneDefault(fieldSchema.defaultValue);
      } else if (fieldSchema.required && !options.partial && !fieldSchema.generated) {
        errors.push(`${fieldPath} is required.`);
      }
      continue;
    }

    if (fieldSchema.generated && !options.allowGenerated) {
      errors.push(`${fieldPath} is managed by the server.`);
      continue;
    }

    const result = validateValue(value, fieldSchema, fieldPath, options);
    if (result.errors.length > 0) {
      errors.push(...result.errors);
      continue;
    }

    output[fieldName] = result.value;
  }

  for (const fieldName of Object.keys(input)) {
    if (!schema[fieldName]) {
      errors.push(`${path}.${fieldName} is not supported.`);
    }
  }

  return {
    valid: errors.length === 0,
    value: output,
    errors
  };
}

function validateValue(
  value: unknown,
  schema: Schema,
  path: string,
  options: Required<ValidationOptions>
): { value: unknown; errors: string[] } {
  if (value === null) {
    return { value, errors: schema.required ? [`${path} cannot be null.`] : [] };
  }

  switch (schema.type) {
    case "string":
      return validateString(value, schema, path);
    case "number":
      return validateNumber(value, schema, path);
    case "integer":
      return validateInteger(value, schema, path);
    case "enum":
      return validateEnum(value, schema, path);
    case "url":
      return validateUrl(value, path);
    case "email":
      return validateEmail(value, path);
    case "datetime":
      return validateDateTime(value, path);
    case "object":
      return validateObject(value, schema.fields, path, options);
    case "array":
      return validateArray(value, schema, path, options);
  }
}

function validateString(value: unknown, schema: StringSchema, path: string) {
  if (typeof value !== "string") {
    return { value, errors: [`${path} must be a string.`] };
  }

  const trimmed = value.trim();
  const errors: string[] = [];

  if (schema.required && trimmed.length === 0) {
    errors.push(`${path} cannot be empty.`);
  }

  if (schema.maxLength && trimmed.length > schema.maxLength) {
    errors.push(`${path} must be ${schema.maxLength} characters or fewer.`);
  }

  return { value: trimmed, errors };
}

function validateNumber(value: unknown, schema: NumberSchema, path: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { value, errors: [`${path} must be a finite number.`] };
  }

  return validateRange(value, schema, path);
}

function validateInteger(value: unknown, schema: IntegerSchema, path: string) {
  if (!Number.isInteger(value)) {
    return { value, errors: [`${path} must be an integer.`] };
  }

  return validateRange(value as number, schema, path);
}

function validateRange(value: number, schema: NumberSchema | IntegerSchema, path: string) {
  const errors: string[] = [];

  if (schema.min !== undefined && value < schema.min) {
    errors.push(`${path} must be greater than or equal to ${schema.min}.`);
  }

  if (schema.max !== undefined && value > schema.max) {
    errors.push(`${path} must be less than or equal to ${schema.max}.`);
  }

  return { value, errors };
}

function validateEnum(value: unknown, schema: EnumSchema, path: string) {
  if (typeof value !== "string" || !schema.values.includes(value)) {
    return {
      value,
      errors: [`${path} must be one of: ${schema.values.join(", ")}.`]
    };
  }

  return { value, errors: [] };
}

function validateUrl(value: unknown, path: string) {
  if (typeof value !== "string") {
    return { value, errors: [`${path} must be a URL string.`] };
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return { value, errors: [`${path} must use http or https.`] };
    }
    return { value: url.toString(), errors: [] };
  } catch {
    return { value, errors: [`${path} must be a valid URL.`] };
  }
}

function validateEmail(value: unknown, path: string) {
  if (typeof value !== "string") {
    return { value, errors: [`${path} must be an email string.`] };
  }

  const trimmed = value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  return {
    value: trimmed,
    errors: valid ? [] : [`${path} must be a valid email address.`]
  };
}

function validateDateTime(value: unknown, path: string) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return { value, errors: [`${path} must be a valid ISO date-time string.`] };
  }

  return { value: new Date(value).toISOString(), errors: [] };
}

function validateArray(value: unknown, schema: ArraySchema, path: string, options: Required<ValidationOptions>) {
  if (!Array.isArray(value)) {
    return { value, errors: [`${path} must be an array.`] };
  }

  const output: unknown[] = [];
  const errors: string[] = [];

  value.forEach((item, index) => {
    const result = validateValue(item, schema.item, `${path}[${index}]`, options);
    if (result.errors.length > 0) {
      errors.push(...result.errors);
      return;
    }

    output.push(result.value);
  });

  return { value: output, errors };
}

function cloneDefault(value: unknown) {
  return Array.isArray(value) ? [...value] : value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
