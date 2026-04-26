import type { RequestHandler } from "express";

type ValidationRule =
  | {
      type: "string" | "url";
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    }
  | {
      type: "integer";
      required?: boolean;
      min?: number;
      max?: number;
    }
  | {
      type: "stringArray";
      required?: boolean;
      minItems?: number;
      maxItems?: number;
      maxLength?: number;
    };

type ValidationSchema = Record<string, ValidationRule>;

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationOptions {
  requireAtLeastOne?: boolean;
}

interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors: ValidationError[];
}

export function validateBody<T>(
  schema: ValidationSchema,
  options: ValidationOptions = {}
): RequestHandler {
  return (request, response, next) => {
    const result = validateObject<T>(request.body, schema, options);

    if (!result.valid) {
      response.status(400).json({
        error: {
          code: "validation_error",
          message: "Request body validation failed",
          details: result.errors
        }
      });
      return;
    }

    request.body = result.value;
    next();
  };
}

export function validateObject<T>(
  value: unknown,
  schema: ValidationSchema,
  options: ValidationOptions = {}
): ValidationResult<T> {
  const errors: ValidationError[] = [];
  const normalized: Record<string, unknown> = {};

  if (!isPlainObject(value)) {
    return {
      valid: false,
      errors: [{ field: "body", message: "Expected an object" }]
    };
  }

  const allowedFields = new Set(Object.keys(schema));
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) {
      errors.push({ field, message: "Unknown field" });
    }
  }

  for (const [field, rules] of Object.entries(schema)) {
    const fieldValue = value[field];

    if (fieldValue === undefined || fieldValue === null) {
      if (rules.required) {
        errors.push({ field, message: "Field is required" });
      }
      continue;
    }

    validateField(field, fieldValue, rules, normalized, errors);
  }

  if (options.requireAtLeastOne && Object.keys(normalized).length === 0) {
    errors.push({ field: "body", message: "At least one field is required" });
  }

  return {
    valid: errors.length === 0,
    value: normalized as T,
    errors
  };
}

function validateField(
  field: string,
  value: unknown,
  rules: ValidationRule,
  normalized: Record<string, unknown>,
  errors: ValidationError[]
): void {
  switch (rules.type) {
    case "string":
    case "url":
      validateString(field, value, rules, normalized, errors);
      return;
    case "integer":
      validateInteger(field, value, rules, normalized, errors);
      return;
    case "stringArray":
      validateStringArray(field, value, rules, normalized, errors);
      return;
  }
}

function validateString(
  field: string,
  value: unknown,
  rules: Extract<ValidationRule, { type: "string" | "url" }>,
  normalized: Record<string, unknown>,
  errors: ValidationError[]
): void {
  if (typeof value !== "string") {
    errors.push({ field, message: "Expected a string" });
    return;
  }

  const trimmed = value.trim();
  if (rules.minLength !== undefined && trimmed.length < rules.minLength) {
    errors.push({ field, message: `Must be at least ${rules.minLength} characters` });
  }

  if (rules.maxLength !== undefined && trimmed.length > rules.maxLength) {
    errors.push({ field, message: `Must be at most ${rules.maxLength} characters` });
  }

  if (rules.type === "url" && trimmed.length > 0 && !isValidUrl(trimmed)) {
    errors.push({ field, message: "Expected a valid URL" });
  }

  normalized[field] = trimmed;
}

function validateInteger(
  field: string,
  value: unknown,
  rules: Extract<ValidationRule, { type: "integer" }>,
  normalized: Record<string, unknown>,
  errors: ValidationError[]
): void {
  if (!Number.isInteger(value)) {
    errors.push({ field, message: "Expected an integer" });
    return;
  }

  const integerValue = value as number;
  if (rules.min !== undefined && integerValue < rules.min) {
    errors.push({ field, message: `Must be at least ${rules.min}` });
  }

  if (rules.max !== undefined && integerValue > rules.max) {
    errors.push({ field, message: `Must be at most ${rules.max}` });
  }

  normalized[field] = integerValue;
}

function validateStringArray(
  field: string,
  value: unknown,
  rules: Extract<ValidationRule, { type: "stringArray" }>,
  normalized: Record<string, unknown>,
  errors: ValidationError[]
): void {
  if (!Array.isArray(value)) {
    errors.push({ field, message: "Expected an array" });
    return;
  }

  const strings: string[] = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string") {
      errors.push({ field: `${field}[${index}]`, message: "Expected a string" });
      continue;
    }

    const trimmed = item.trim();
    if (trimmed.length === 0) {
      errors.push({ field: `${field}[${index}]`, message: "Must not be empty" });
    }

    if (rules.maxLength !== undefined && trimmed.length > rules.maxLength) {
      errors.push({ field: `${field}[${index}]`, message: `Must be at most ${rules.maxLength} characters` });
    }

    strings.push(trimmed);
  }

  if (rules.minItems !== undefined && strings.length < rules.minItems) {
    errors.push({ field, message: `Must include at least ${rules.minItems} item` });
  }

  if (rules.maxItems !== undefined && strings.length > rules.maxItems) {
    errors.push({ field, message: `Must include at most ${rules.maxItems} items` });
  }

  normalized[field] = strings;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
