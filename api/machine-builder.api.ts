import type { APIRequestContext } from '@playwright/test';
import { csrfToken, graphql, siteOrigin } from './client.api';

export type DesignInput = {
  name?: string;
  description?: string;
  designCategoryCodes?: string;
  tags?: string[];
};

export type Design = {
  id: string;
  name: string | null;
  description: string | null;
  designCategory: { id: string; fullCode: string | null } | null;
  tags: { id: string; name: string | null }[];
};

// In-stock controllers from GET /api/v3/assembler/parts.
// These four are visible in the parts browser.
// Using a subset of parts for now as for the scope of this project.
export const Part = {
  machineMotionAi: {
    partNumber: 'CE-CL-030-1500',
    name: 'MachineMotion AI',
  },
  machineMotionAiRobot: {
    partNumber: 'CE-CL-030-0000',
    name: 'MachineMotion AI Robot',
  },
  machineMotionAiPro: {
    partNumber: 'CE-CL-031-3000',
    name: 'MachineMotion AI Pro',
  },
  machineMotionAiRobotPro: {
    partNumber: 'CE-CL-031-0000',
    name: 'MachineMotion AI Robot Pro',
  },
} as const;

export type PartKey = keyof typeof Part;

export type DesignPricePart = {
  part_number: string;
  quantity: number;
  name: string;
};

export type DesignPrice = {
  price: string;
  bom: DesignPricePart[];
};

type DesignError = {
  title?: string | null;
  message?: string | null;
  attribute?: string | null;
  data?: unknown;
};

type DesignPayload = {
  design: Design | { id: string } | null;
  errors: DesignError[] | null;
};

const designFields = `
  id
  name
  description
  designCategory { id fullCode }
  tags { id name }
`;

const createDesignQuery = `
  mutation CreateDesign($name: String, $description: String, $designCategoryCodes: String, $tags: [String!]) {
    designCreate(input: { name: $name, description: $description, designCategoryCodes: $designCategoryCodes, tags: $tags }) {
      design { ${designFields} }
      errors { title message attribute data }
    }
  }
`;

const deleteDesignQuery = `
  mutation DeleteDesign($id: ID!) {
    designDelete(input: { id: $id }) {
      design { id }
      errors { title message attribute data }
    }
  }
`;

export async function createDesign(
  request: APIRequestContext,
  input: DesignInput = {},
): Promise<Design> {
  const data = await graphql<{ designCreate: DesignPayload | null }>(
    request,
    createDesignQuery,
    {
      name: input.name ?? null,
      description: input.description ?? null,
      designCategoryCodes: input.designCategoryCodes ?? null,
      tags: input.tags ?? null,
    },
  );
  return designResult(data.designCreate, 'Cannot create the design') as Design;
}

export async function deleteDesign(
  request: APIRequestContext,
  id: string,
): Promise<void> {
  const data = await graphql<{ designDelete: DesignPayload | null }>(
    request,
    deleteDesignQuery,
    { id },
  );
  designResult(data.designDelete, `Cannot delete design ${id}`);
}

export async function addParts(
  request: APIRequestContext,
  designId: string,
  quantities: Partial<Record<PartKey, number>>,
): Promise<DesignPrice> {
  const response = await request.post(priceUrl(designId), {
    headers: {
      Accept: 'application/json',
      Origin: siteOrigin(),
      Referer: new URL(`/machine-builder/${designId}`, siteOrigin()).href,
      'X-CSRF-Token': await csrfToken(request),
    },
    data: {
      parts: partQuantities(quantities),
      light_duty_parts: {},
      light_and_regular_duty_parts: {},
      add_ons: {},
      part_kits: [],
      imported_panels: [],
      imported_custom_priced: [],
      imported_panels_strip: [],
    },
  });
  if (!response.ok()) {
    throw new Error(
      `Cannot add parts to design ${designId}: ${response.status()}`,
    );
  }
  return (await response.json()) as DesignPrice;
}

function partQuantities(
  quantities: Partial<Record<PartKey, number>>,
): Record<string, number> {
  const parts: Record<string, number> = {};
  for (const [key, quantity] of Object.entries(quantities) as [
    PartKey,
    number | undefined,
  ][]) {
    if (quantity === undefined) continue;
    const part = Part[key];
    if (!part) throw new Error(`Unknown part ${key}`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Quantity for ${part.name} must be a positive integer`);
    }
    parts[part.partNumber] = quantity;
  }
  if (Object.keys(parts).length === 0) {
    throw new Error('Choose at least one part');
  }
  return parts;
}

function priceUrl(designId: string): string {
  return new URL(`/api/v3/designs/${designId}/price`, siteOrigin()).href;
}

function designResult(
  payload: DesignPayload | null,
  action: string,
): Design | { id: string } {
  if (!payload) throw new Error(`${action}: no response`);
  const messages = (payload.errors ?? [])
    .map((error) => error.message)
    .filter((message): message is string => Boolean(message));
  if (messages.length > 0) throw new Error(`${action}: ${messages.join(', ')}`);
  if (!payload.design) throw new Error(`${action}: no design returned`);
  return payload.design;
}
