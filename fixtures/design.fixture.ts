import { test as base } from '@playwright/test';
import {
  createDesign,
  deleteDesign,
  type Design,
} from '../api/machine-builder.api';

type DesignFixtures = {
  design: Design;
};

export const test = base.extend<DesignFixtures>({
  design: async ({ request }, use) => {
    const design = await createDesign(request, {
      name: `QA disposable ${Date.now()}`,
    });
    try {
      await use(design);
    } finally {
      await deleteDesign(request, design.id);
    }
  },
});

export { expect } from '@playwright/test';
